"""
ETL - Candidaturas TSE 2026 -> Supabase (Postgres)

Baixa os recursos do dataset "Candidatos - 2026" do Portal de Dados Abertos do
TSE, extrai os CSVs e carrega em tabelas "raw" no Postgres, com colunas
criadas dinamicamente a partir do header real de cada arquivo (tudo como
TEXT nessa camada). A camada curada/tipada é responsabilidade dos scripts
em sql/02_curada.sql, rodados depois desta carga.

Uso:
    python scraper/download_and_load.py
    python scraper/download_and_load.py --only candidatos bens_candidato
"""

from __future__ import annotations

import argparse
import io
import os
import sys
import time
import zipfile
from dataclasses import dataclass

import pandas as pd
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from tqdm import tqdm

load_dotenv()

BASE = "https://cdn.tse.jus.br/estatistica/sead/odsele"

RESOURCES = {
    "candidatos": {
        "url": f"{BASE}/consulta_cand/consulta_cand_2026.zip",
        "table": "raw_candidatos",
    },
    "candidatos_complementar": {
        "url": f"{BASE}/consulta_cand_complementar/consulta_cand_complementar_2026.zip",
        "table": "raw_candidatos_complementar",
    },
    "bens_candidato": {
        "url": f"{BASE}/bem_candidato/bem_candidato_2026.zip",
        "table": "raw_bens_candidato",
    },
    "coligacoes": {
        "url": f"{BASE}/consulta_coligacao/consulta_coligacao_2026.zip",
        "table": "raw_coligacoes",
    },
    "vagas": {
        "url": f"{BASE}/consulta_vagas/consulta_vagas_2026.zip",
        "table": "raw_vagas",
    },
    "motivo_cassacao": {
        "url": f"{BASE}/motivo_cassacao/motivo_cassacao_2026.zip",
        "table": "raw_motivo_cassacao",
    },
    "redes_sociais": {
        "url": f"{BASE}/consulta_cand/rede_social_candidato_2026.zip",
        "table": "raw_redes_sociais",
    },
}

# O CDN do TSE fica atrás do Akamai, que devolve 403 para requests que não
# parecem um browser (o User-Agent padrão do python-requests é bloqueado, e
# faltando os client-hints "sec-ch-ua*" o 403 volta mesmo com User-Agent falso).
# Este conjunto passa de forma consistente.
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,*/*;q=0.8"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Referer": "https://dadosabertos.tse.jus.br/",
    "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-site",
    "Upgrade-Insecure-Requests": "1",
}

MAX_RETRIES = 4
LEIAME_DIR = "scraper/_leiame"


@dataclass
class DownloadedCsv:
    filename: str
    content: bytes


def download_zip(url: str) -> bytes:
    # o Akamai do TSE às vezes devolve 403/503 transitório sob rate limit ao
    # baixar os 7 zips em sequência; tenta de novo com backoff antes de desistir.
    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        resp = requests.get(url, headers=HEADERS, timeout=180)
        if resp.status_code == 200:
            return resp.content
        last_exc = requests.HTTPError(f"{resp.status_code} para {url}")
        if attempt < MAX_RETRIES:
            wait = 3 * attempt
            print(f"[retry {attempt}/{MAX_RETRIES}] {resp.status_code}, aguardando {wait}s")
            time.sleep(wait)
    raise last_exc  # type: ignore[misc]


def _pick_national(csv_names: list[str]) -> list[str]:
    """
    Cada zip do TSE traz um CSV por UF (..._AC.csv, ..._SP.csv, ..._BR.csv) E um
    consolidado nacional (..._BRASIL.csv) que é a união exata de todos. Se
    carregássemos os dois, cada candidato entraria em dobro. Quando existe o
    _BRASIL, usamos só ele (é o "arquivo nacional" que o README pede).
    """
    national = [n for n in csv_names if n.upper().endswith("_BRASIL.CSV")]
    return national or csv_names


def extract_csvs(zip_bytes: bytes, resource_key: str) -> list[DownloadedCsv]:
    out = []
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        all_csvs = [n for n in zf.namelist() if n.lower().endswith(".csv")]
        wanted = set(_pick_national(all_csvs))
        for name in zf.namelist():
            if name in wanted:
                out.append(DownloadedCsv(filename=name, content=zf.read(name)))
            elif name.lower().endswith("leiame.pdf") or name.lower().endswith("leiame.txt"):
                # guarda o leiame ao lado para consulta manual do layout de colunas.
                # prefixa com o recurso porque todos os zips chamam o arquivo de "leiame.pdf".
                os.makedirs(LEIAME_DIR, exist_ok=True)
                dest = f"{resource_key}__{os.path.basename(name)}"
                with open(os.path.join(LEIAME_DIR, dest), "wb") as f:
                    f.write(zf.read(name))
    return out


def read_tse_csv(raw_bytes: bytes) -> pd.DataFrame:
    """
    Arquivos do TSE tipicamente vêm com separador ';' e encoding latin-1 (cp1252).
    Lemos tudo como string na camada raw - tipagem fica pra camada curada em SQL.
    """
    return pd.read_csv(
        io.BytesIO(raw_bytes),
        sep=";",
        encoding="latin-1",
        dtype=str,
        keep_default_na=False,
        na_values=["#NULO#", "#NULO", ""],
        low_memory=False,
    )


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    return df


def load_to_postgres(df: pd.DataFrame, table: str, engine) -> int:
    # A tabela raw é (re)criada a cada rodada a partir do header real do arquivo
    # (idempotente para um scrape "hoje"). NÃO precisa criar as tabelas à mão
    # antes: o schema sai daqui.
    #
    # DROP ... CASCADE explícito: numa re-execução as views curadas dependem das
    # tabelas raw; o DROP simples do to_sql falharia. Depois de re-raspar, rode
    # sql/02_curada.sql de novo para recriar as views.
    #
    # Carga via COPY (não INSERT): dezenas de milhares de linhas por INSERT
    # multi-values levam minutos só no SQLAlchemy; COPY faz em segundos.
    with engine.begin() as conn:
        conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))

    # cria o schema (0 linhas) — tipos corretos: TEXT nas colunas do CSV,
    # TIMESTAMP em _carregado_em
    df.head(0).to_sql(table, engine, if_exists="replace", index=False)

    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False, na_rep="")
    buf.seek(0)

    raw = engine.raw_connection()
    try:
        with raw.cursor() as cur:
            cols = ", ".join(f'"{c}"' for c in df.columns)
            cur.copy_expert(
                f'COPY "{table}" ({cols}) FROM STDIN WITH (FORMAT csv, NULL \'\')',
                buf,
            )
        raw.commit()
    finally:
        raw.close()

    with engine.connect() as conn:
        count = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"')).scalar()
    return count


def run(only: list[str] | None = None) -> None:
    db_url = os.environ.get("SUPABASE_DB_URL")
    if not db_url:
        sys.exit("Defina SUPABASE_DB_URL no .env (veja .env.example)")

    engine = create_engine(db_url)

    keys = only if only else list(RESOURCES.keys())
    for key in keys:
        if key not in RESOURCES:
            print(f"[aviso] recurso desconhecido: {key}, pulando")
            continue

        cfg = RESOURCES[key]
        print(f"\n=== {key} ===")
        print(f"baixando {cfg['url']}")
        zip_bytes = download_zip(cfg["url"])

        csvs = extract_csvs(zip_bytes, key)
        if not csvs:
            print(f"[aviso] nenhum CSV encontrado no zip de {key}")
            continue
        print(f"carregando {len(csvs)} arquivo(s): {', '.join(c.filename for c in csvs)}")

        frames = []
        for csv_item in tqdm(csvs, desc=f"lendo CSVs de {key}"):
            df = read_tse_csv(csv_item.content)
            frames.append(df)

        full_df = pd.concat(frames, ignore_index=True) if len(frames) > 1 else frames[0]
        full_df = normalize_columns(full_df)

        # metadado de carga - ajuda a auditar quando cada raspagem foi feita
        full_df["_carregado_em"] = pd.Timestamp.utcnow()

        n = load_to_postgres(full_df, cfg["table"], engine)
        print(f"-> {cfg['table']}: {n} linhas carregadas ({len(full_df.columns)} colunas)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--only",
        nargs="*",
        help=f"subset de recursos a rodar. Opções: {', '.join(RESOURCES.keys())}",
    )
    args = parser.parse_args()
    run(only=args.only)


if __name__ == "__main__":
    main()
