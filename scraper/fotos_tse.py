"""
Vincula a URL pública da foto de cada candidatura à tabela `candidato_fotos`
no Supabase, usando a API não-oficial do DivulgaCandContas do TSE.

- NÃO baixa nem armazena a imagem — grava só a string da URL.
- Idempotente: pula quem já tem foto_url (ou já foi marcado como sem foto),
  a menos que --force / --retry-misses.
- Roda em lotes por grupo (ano, unidade eleitoral, eleição, cargo): uma chamada
  de listagem cobre todos os candidatos do grupo.

IMPORTANTE: a API do TSE fica atrás de Akamai e:
  - bloqueia requests sem cara de browser (headers já tratados aqui);
  - rate-limita / bane IP sob volume — use --delay e lotes pequenos;
  - NÃO é acessível de dentro de alguns ambientes (datacenter/CI). Rode de uma
    máquina/rede que alcance divulgacandcontas.tse.jus.br (ex.: a sua, ou uma
    function server-side).

Uso típico:
    python scraper/fotos_tse.py --dump --uf SP --cargo 6      # inspeciona 1 grupo
    python scraper/fotos_tse.py --uf SP                       # popula só SP
    python scraper/fotos_tse.py                               # popula tudo que falta
    python scraper/fotos_tse.py --uf RJ --force               # re-processa RJ
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone

import psycopg2
import psycopg2.extras
import requests
from dotenv import load_dotenv

load_dotenv()

API = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Referer": "https://divulgacandcontas.tse.jus.br/divulga/",
    "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
}

# CD_CARGO (raw_candidatos) -> descrição, para o --cargo aceitar nome ou código
CARGOS = {
    "1": "PRESIDENTE", "2": "VICE-PRESIDENTE", "3": "GOVERNADOR",
    "4": "VICE-GOVERNADOR", "5": "SENADOR", "6": "DEPUTADO FEDERAL",
    "7": "DEPUTADO ESTADUAL", "8": "DEPUTADO DISTRITAL",
    "9": "1º SUPLENTE", "10": "2º SUPLENTE",
}

LOG_DIR = os.path.join(os.path.dirname(__file__), "_logs")


# --------------------------------------------------------------------------- #
# HTTP
# --------------------------------------------------------------------------- #
class ApiError(Exception):
    pass


def api_get(session: requests.Session, path: str, *, tries: int = 4, delay: float = 0.4):
    url = f"{API}{path}"
    for attempt in range(1, tries + 1):
        resp = session.get(url, headers=HEADERS, timeout=45)
        if resp.status_code == 200:
            try:
                return resp.json()
            except ValueError:
                raise ApiError(f"resposta não-JSON em {path}: {resp.text[:200]}")
        if resp.status_code == 404:
            return None
        if resp.status_code in (403, 429) or resp.status_code >= 500:
            wait = delay * (2 ** attempt) + attempt
            print(f"  [retry {attempt}/{tries}] {resp.status_code} em {path} — aguardando {wait:.1f}s")
            time.sleep(wait)
            continue
        raise ApiError(f"{resp.status_code} em {path}: {resp.text[:200]}")
    raise ApiError(f"falhou após {tries} tentativas: {path}")


# --------------------------------------------------------------------------- #
# Descoberta do idEleicao do DivulgaCand a partir do nosso cd_eleicao
# --------------------------------------------------------------------------- #
def descobrir_id_eleicao(session, ano: str, cd_eleicao: str, overrides: dict[str, str]) -> str:
    if cd_eleicao in overrides:
        return overrides[cd_eleicao]
    # tenta a lista oficial de eleições ordinárias
    try:
        data = api_get(session, "/eleicao/ordinarias")
    except ApiError:
        data = None
    if data:
        for e in data:
            if str(e.get("ano")) == str(ano) and str(e.get("codigo") or "") == str(cd_eleicao):
                return str(e["id"])
        # sem match por código: mostra as opções do ano pro operador escolher
        do_ano = [e for e in data if str(e.get("ano")) == str(ano)]
        if do_ano:
            print(f"  [aviso] não achei eleição com codigo={cd_eleicao} em {ano}. Opções:")
            for e in do_ano:
                print(f"     id={e['id']}  codigo={e.get('codigo')}  {e.get('nomeEleicao')}  UF={e.get('siglaUF')}")
    # fallback: usa o próprio cd_eleicao como id (funciona em vários anos)
    print(f"  [fallback] usando cd_eleicao={cd_eleicao} como idEleicao")
    return str(cd_eleicao)


# --------------------------------------------------------------------------- #
# fotoUrl -> URL pública final
# --------------------------------------------------------------------------- #
def resolver_foto_url(foto_url_raw, ano, ue, id_eleicao, sq, modo: str) -> str | None:
    """
    A API às vezes devolve fotoUrl absoluta, às vezes relativa, às vezes só o
    nome do arquivo, às vezes null. Quando há foto (campo não-nulo), o endpoint
    determinístico .../candidato/{sq}/foto serve a imagem — é o mais estável.
    """
    endpoint = f"{API}/candidatura/buscar/{ano}/{ue}/{id_eleicao}/candidato/{sq}/foto"

    if modo == "endpoint":
        return endpoint if foto_url_raw else None
    if not foto_url_raw:
        return None
    s = str(foto_url_raw).strip()
    if not s or s.lower() in ("null", "none"):
        return None
    if modo == "field":
        if s.startswith("http://"):
            return "https://" + s[len("http://"):]
        if s.startswith("https://"):
            return s
        if s.startswith("/"):
            return "https://divulgacandcontas.tse.jus.br" + s
        return endpoint  # só o nome do arquivo — cai no endpoint
    # modo auto
    if s.startswith(("http://", "https://")):
        return s.replace("http://", "https://", 1)
    if s.startswith("/"):
        return "https://divulgacandcontas.tse.jus.br" + s
    return endpoint


# --------------------------------------------------------------------------- #
# DB
# --------------------------------------------------------------------------- #
def conectar():
    url = os.environ.get("SUPABASE_DB_URL")
    if not url:
        sys.exit("Defina SUPABASE_DB_URL no .env")
    return psycopg2.connect(url)


def carregar_pendentes(conn, *, ano, ufs, cargos, force, retry_misses):
    cond = ["c.ano_eleicao = %(ano)s", "c.sq_candidato IS NOT NULL"]
    params: dict = {"ano": str(ano)}
    if ufs:
        cond.append("c.sg_uf = ANY(%(ufs)s)")
        params["ufs"] = ufs
    if cargos:
        cond.append("c.cd_cargo = ANY(%(cargos)s)")
        params["cargos"] = cargos
    if not force:
        if retry_misses:
            # ainda sem URL: nunca tentado, ou tentado e não achou
            cond.append("(f.sq_candidato IS NULL OR f.foto_url IS NULL)")
        else:
            cond.append("f.sq_candidato IS NULL")

    sql = f"""
        SELECT c.sq_candidato, c.nr_candidato, c.sg_uf, c.sg_ue,
               c.cd_cargo, c.ds_cargo, c.cd_eleicao, c.ano_eleicao,
               c.nm_urna_candidato
        FROM raw_candidatos c
        LEFT JOIN candidato_fotos f ON f.sq_candidato = c.sq_candidato
        WHERE {' AND '.join(cond)}
        ORDER BY c.sg_ue, c.cd_eleicao, c.cd_cargo, c.sq_candidato
    """
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(sql, params)
        return cur.fetchall()


def gravar(conn, registros: list[dict]):
    if not registros:
        return
    sql = """
        INSERT INTO candidato_fotos
            (sq_candidato, ano_eleicao, sg_ue, cd_cargo, foto_url, origem,
             foto_atualizada_em, tentado_em)
        VALUES (%(sq)s, %(ano)s, %(ue)s, %(cargo)s, %(url)s, %(origem)s,
                %(atualizada)s, now())
        ON CONFLICT (sq_candidato) DO UPDATE SET
            foto_url = EXCLUDED.foto_url,
            origem = EXCLUDED.origem,
            foto_atualizada_em = EXCLUDED.foto_atualizada_em,
            tentado_em = now()
    """
    with conn.cursor() as cur:
        psycopg2.extras.execute_batch(cur, sql, registros, page_size=500)
    conn.commit()


# --------------------------------------------------------------------------- #
# principal
# --------------------------------------------------------------------------- #
def run(args):
    os.makedirs(LOG_DIR, exist_ok=True)
    log_path = os.path.join(LOG_DIR, f"fotos_{datetime.now():%Y%m%d_%H%M%S}.jsonl")
    logf = open(log_path, "w", encoding="utf-8")

    def log(**kw):
        logf.write(json.dumps(kw, ensure_ascii=False) + "\n")
        logf.flush()

    overrides = {}
    if args.id_eleicao:
        for pair in args.id_eleicao:
            cd, _, idv = pair.partition(":")
            overrides[cd] = idv

    conn = conectar()
    linhas = carregar_pendentes(
        conn, ano=args.ano, ufs=args.uf, cargos=args.cargo,
        force=args.force, retry_misses=args.retry_misses,
    )
    print(f"{len(linhas)} candidatura(s) a processar (ano {args.ano}).")
    if not linhas:
        return

    # agrupa por (ano, sg_ue, cd_eleicao, cd_cargo)
    grupos: dict[tuple, list[dict]] = defaultdict(list)
    for r in linhas:
        grupos[(r["ano_eleicao"], r["sg_ue"], r["cd_eleicao"], r["cd_cargo"])].append(r)
    print(f"{len(grupos)} grupo(s) (ano/UE/eleição/cargo).")

    session = requests.Session()
    id_eleicao_cache: dict[tuple, str] = {}

    tot_ok = tot_sem = tot_erro_grupo = 0
    grupos_erro: list[dict] = []
    processados = 0

    for i, (chave, rows) in enumerate(sorted(grupos.items()), 1):
        ano, ue, cd_eleicao, cd_cargo = chave
        if args.limit_grupos and i > args.limit_grupos:
            print(f"… parando em --limit-grupos={args.limit_grupos}")
            break

        cache_key = (ano, cd_eleicao)
        if cache_key not in id_eleicao_cache:
            id_eleicao_cache[cache_key] = descobrir_id_eleicao(session, ano, cd_eleicao, overrides)
            time.sleep(args.delay)
        id_eleicao = id_eleicao_cache[cache_key]

        path = f"/candidatura/listar/{ano}/{ue}/{id_eleicao}/{cd_cargo}/candidatos"
        rotulo = f"[{i}/{len(grupos)}] UE={ue} cargo={cd_cargo}({CARGOS.get(cd_cargo,'?')}) — {len(rows)} cand."
        print(rotulo)

        try:
            data = api_get(session, path, tries=args.tries, delay=args.delay)
        except ApiError as e:
            print(f"  ERRO: {e}")
            grupos_erro.append({"path": path, "erro": str(e), "n": len(rows)})
            log(evento="grupo_erro", path=path, erro=str(e))
            tot_erro_grupo += 1
            time.sleep(args.delay)
            continue

        if args.dump:
            print(json.dumps(data, ensure_ascii=False, indent=2)[:6000])
            # também um buscar individual, pra ver o schema completo
            sq0 = rows[0]["sq_candidato"]
            print(f"\n--- buscar individual {sq0} ---")
            ind = api_get(session, f"/candidatura/buscar/{ano}/{ue}/{id_eleicao}/candidato/{sq0}",
                          tries=args.tries, delay=args.delay)
            print(json.dumps(ind, ensure_ascii=False, indent=2)[:6000])
            return

        cands = (data or {}).get("candidatos") or []
        por_id = {str(c.get("id")): c for c in cands}
        por_numero = {str(c.get("numero")): c for c in cands}

        registros = []
        for r in rows:
            sq = r["sq_candidato"]
            item = por_id.get(str(sq)) or por_numero.get(str(r["nr_candidato"]))
            origem = "listar"
            if item is None:
                # fallback individual
                try:
                    item = api_get(session, f"/candidatura/buscar/{ano}/{ue}/{id_eleicao}/candidato/{sq}",
                                   tries=args.tries, delay=args.delay)
                    origem = "buscar"
                    time.sleep(args.delay)
                except ApiError:
                    item = None
            if item is None:
                registros.append(dict(sq=sq, ano=ano, ue=ue, cargo=cd_cargo,
                                      url=None, origem="nao_encontrado", atualizada=None))
                tot_sem += 1
                log(evento="sem_match", sq=sq, path=path, nome=r["nm_urna_candidato"])
                continue

            url = resolver_foto_url(item.get("fotoUrl"), ano, ue, id_eleicao, sq, args.foto_modo)
            if url:
                registros.append(dict(sq=sq, ano=ano, ue=ue, cargo=cd_cargo, url=url,
                                      origem=origem,
                                      atualizada=datetime.now(timezone.utc)))
                tot_ok += 1
            else:
                registros.append(dict(sq=sq, ano=ano, ue=ue, cargo=cd_cargo, url=None,
                                      origem="nao_encontrado", atualizada=None))
                tot_sem += 1
                log(evento="sem_foto_no_payload", sq=sq, nome=r["nm_urna_candidato"])

        if not args.dry_run:
            gravar(conn, registros)
        processados += len(rows)
        print(f"  ok={tot_ok} sem_foto={tot_sem}  (grupo gravado{' [dry-run]' if args.dry_run else ''})")
        log(evento="grupo_ok", path=path, n=len(rows), ok_acum=tot_ok, sem_acum=tot_sem)
        time.sleep(args.delay)

    conn.close()
    logf.close()

    print("\n===== RESUMO =====")
    print(f"candidaturas processadas : {processados}")
    print(f"com foto_url gravada     : {tot_ok}")
    print(f"sem foto (TSE)           : {tot_sem}")
    print(f"grupos com erro de req.  : {tot_erro_grupo}")
    if grupos_erro:
        print("  reprocessar:")
        for g in grupos_erro:
            print(f"    {g['path']}  ({g['n']} cand.)  — {g['erro'][:120]}")
    print(f"log: {log_path}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--ano", default="2026")
    p.add_argument("--uf", nargs="*", help="siglas de UF (sg_uf); ex.: --uf SP RJ. 'BR' = presidência")
    p.add_argument("--cargo", nargs="*", help="cd_cargo(s) ou nome(s); ex.: --cargo 6 7  ou  --cargo 'DEPUTADO FEDERAL'")
    p.add_argument("--id-eleicao", nargs="*", metavar="CD:ID",
                   help="override do idEleicao do DivulgaCand por cd_eleicao. ex.: --id-eleicao 6257:xxxx 6259:yyyy")
    p.add_argument("--foto-modo", choices=["auto", "field", "endpoint"], default="auto",
                   help="como derivar a URL final da foto (default auto). 'endpoint' = sempre .../candidato/{sq}/foto")
    p.add_argument("--force", action="store_true", help="reprocessa mesmo quem já tem registro")
    p.add_argument("--retry-misses", action="store_true", help="retenta quem ficou sem foto_url")
    p.add_argument("--limit-grupos", type=int, default=0)
    p.add_argument("--delay", type=float, default=0.4, help="segundos entre requisições (default 0.4)")
    p.add_argument("--tries", type=int, default=4)
    p.add_argument("--dry-run", action="store_true", help="não grava no banco")
    p.add_argument("--dump", action="store_true", help="baixa 1 grupo, imprime o JSON cru e sai")
    args = p.parse_args()

    if args.cargo:
        nome2cod = {v: k for k, v in CARGOS.items()}
        args.cargo = [c if c.isdigit() else nome2cod.get(c.upper(), c) for c in args.cargo]

    run(args)


if __name__ == "__main__":
    main()
