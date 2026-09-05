"""
Sobe as fotos de candidatura (ZIPs do TSE já extraídos em fotos/) para o
Supabase Storage e grava a URL pública em `candidato_fotos.foto_url`.

- Nome dos arquivos do TSE: F{UF}{SQ_CANDIDATO}_div.jpg
- Bucket público 'fotos-candidatos', objeto '{sq_candidato}.jpg'
- Idempotente: pula quem já tem foto_url (salvo --force). Retomável.

Precisa no .env: SUPABASE_DB_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY (chave secreta).

Uso:
    python scraper/fotos_upload.py                 # tudo que estiver em fotos/
    python scraper/fotos_upload.py --uf RJ MG
    python scraper/fotos_upload.py --force         # re-sobe e regrava
    python scraper/fotos_upload.py --dry-run       # não sobe nada, só relata
"""

from __future__ import annotations

import argparse
import mimetypes
import os
import re
import sys
import threading
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

import psycopg2
import psycopg2.extras
import requests
from dotenv import load_dotenv

load_dotenv()

BUCKET = "fotos-candidatos"
NOME_ARQUIVO = re.compile(r"^F([A-Z]{2})(\d{6,})_div\.(jpe?g|png)$", re.IGNORECASE)


def env(k: str) -> str:
    v = os.environ.get(k)
    if not v:
        sys.exit(f"defina {k} no .env")
    return v


SUPA_URL = env("SUPABASE_URL").rstrip("/")
KEY = env("SUPABASE_SERVICE_KEY")
AUTH = {"Authorization": f"Bearer {KEY}", "apikey": KEY}


# --------------------------------------------------------------------------- #
def garantir_bucket() -> None:
    r = requests.get(f"{SUPA_URL}/storage/v1/bucket/{BUCKET}", headers=AUTH, timeout=20)
    if r.status_code == 200:
        return
    r = requests.post(
        f"{SUPA_URL}/storage/v1/bucket",
        headers=AUTH,
        timeout=20,
        json={
            "id": BUCKET,
            "name": BUCKET,
            "public": True,
            "file_size_limit": 3_000_000,
            "allowed_mime_types": ["image/jpeg", "image/png"],
        },
    )
    if r.status_code not in (200, 201):
        sys.exit(f"falha criando bucket: {r.status_code} {r.text}")
    print(f"bucket '{BUCKET}' criado (público).")


def escanear(root: str, ufs: set[str] | None) -> dict[str, tuple[str, str]]:
    """sq_candidato -> (uf_do_arquivo, caminho)"""
    achados: dict[str, tuple[str, str]] = {}
    for dirpath, _dirs, files in os.walk(root):
        for fn in files:
            m = NOME_ARQUIVO.match(fn)
            if not m:
                continue
            uf, sq = m.group(1).upper(), m.group(2)
            if ufs and uf not in ufs:
                continue
            achados.setdefault(sq, (uf, os.path.join(dirpath, fn)))
    return achados


_local = threading.local()


def _sessao() -> requests.Session:
    s = getattr(_local, "s", None)
    if s is None:
        s = requests.Session()
        s.headers.update(AUTH)
        _local.s = s
    return s


def upload_um(sq: str, path: str) -> tuple[bool, str | None]:
    with open(path, "rb") as fh:
        data = fh.read()
    ct = mimetypes.guess_type(path)[0] or "image/jpeg"
    dest = f"{SUPA_URL}/storage/v1/object/{BUCKET}/{sq}.jpg"
    headers = {"Content-Type": ct, "x-upsert": "true", "Cache-Control": "public, max-age=31536000"}
    err = "?"
    for attempt in range(1, 5):
        try:
            r = _sessao().post(dest, headers=headers, data=data, timeout=60)
        except requests.RequestException as e:
            err = str(e)
        else:
            if r.status_code in (200, 201):
                return True, None
            err = f"{r.status_code} {r.text[:150]}"
            if not (r.status_code == 429 or r.status_code >= 500):
                return False, err
        time.sleep(1.5 * attempt)
    return False, err


def run(args: argparse.Namespace) -> None:
    if not os.path.isdir(args.dir):
        sys.exit(f"pasta não encontrada: {args.dir}")
    ufs = {u.upper() for u in args.uf} if args.uf else None

    achados = escanear(args.dir, ufs)
    print(f"{len(achados)} arquivo(s) de foto em {args.dir}/")
    if not achados:
        return

    conn = psycopg2.connect(env("SUPABASE_DB_URL"))
    with conn.cursor() as cur:
        cur.execute("SELECT DISTINCT sg_uf FROM raw_candidatos ORDER BY 1")
        ufs_todas = [r[0] for r in cur.fetchall()]
        cur.execute("SELECT sq_candidato, sg_uf, cd_cargo FROM raw_candidatos")
        meta_por_sq = {r[0]: (r[1], r[2]) for r in cur.fetchall()}
        cur.execute("SELECT sq_candidato FROM candidato_fotos WHERE foto_url IS NOT NULL")
        ja_no_banco = {r[0] for r in cur.fetchall()}
        # já no Storage (retoma sem re-subir)
        cur.execute("SELECT name FROM storage.objects WHERE bucket_id = %s", (BUCKET,))
        ja_no_storage = {n.rsplit(".", 1)[0] for (n,) in cur.fetchall()}

    if not args.dry_run:
        garantir_bucket()

    def grava_lote(feitos: list[tuple[str, str, str]]) -> None:
        if not feitos or args.dry_run:
            return
        rows = [
            dict(sq=sq, uf=uf, cargo=cargo,
                 url=f"{SUPA_URL}/storage/v1/object/public/{BUCKET}/{sq}.jpg")
            for sq, uf, cargo in feitos
        ]
        with conn.cursor() as cur:
            psycopg2.extras.execute_batch(cur, """
                INSERT INTO candidato_fotos
                    (sq_candidato, ano_eleicao, sg_ue, cd_cargo, foto_url, origem,
                     foto_atualizada_em, tentado_em)
                VALUES (%(sq)s, '2026', %(uf)s, %(cargo)s, %(url)s, 'tse_zip', now(), now())
                ON CONFLICT (sq_candidato) DO UPDATE SET
                    foto_url = EXCLUDED.foto_url, origem = 'tse_zip',
                    foto_atualizada_em = now(), tentado_em = now()
            """, rows, page_size=500)
        conn.commit()

    tarefas: list[tuple[str, str, str, str]] = []  # sq, uf_base, cargo, path
    fora_da_base: list[str] = []
    ja_ok = 0
    for sq, (_uf_arq, path) in achados.items():
        if sq not in meta_por_sq:
            fora_da_base.append(sq)
            continue
        if not args.force and sq in ja_no_banco and sq in ja_no_storage:
            ja_ok += 1
            continue
        uf_base, cargo = meta_por_sq[sq]
        tarefas.append((sq, uf_base, cargo, path))

    print(f"{len(tarefas)} para subir | {ja_ok} já ok | {len(fora_da_base)} fora da base (ignorados)", flush=True)

    ok: list[tuple[str, str, str]] = []
    erros: list[tuple[str, str, str | None]] = []
    pendente_grava: list[tuple[str, str, str]] = []

    if not args.dry_run and tarefas:
        with ThreadPoolExecutor(max_workers=args.concorrencia) as ex:
            futs = {ex.submit(upload_um, sq, path): (sq, uf, cargo) for sq, uf, cargo, path in tarefas}
            for i, fut in enumerate(as_completed(futs), 1):
                sq, uf, cargo = futs[fut]
                done, err = fut.result()
                if done:
                    ok.append((sq, uf, cargo))
                    pendente_grava.append((sq, uf, cargo))
                else:
                    erros.append((sq, uf, err))
                if len(pendente_grava) >= 400:
                    grava_lote(pendente_grava)
                    pendente_grava = []
                if i % 100 == 0:
                    print(f"  {i}/{len(tarefas)} (ok {len(ok)}, erro {len(erros)})", flush=True)
        grava_lote(pendente_grava)

    # ------------------------------------------------------------------ relatório
    # varre TUDO (ignora --uf) só pra saber que pastas existem localmente
    todos_arquivos = achados if not ufs else escanear(args.dir, None)
    ufs_arquivo = sorted({uf for uf, _ in todos_arquivos.values()})
    ufs_sem_foto = sorted(set(ufs_todas) - set(ufs_arquivo))
    up_uf = Counter(uf for _, uf, _ in ok)
    err_uf = Counter(uf for _, uf, _ in erros)

    with conn.cursor() as cur:
        cur.execute("""
            SELECT c.sg_uf, count(*) FILTER (WHERE f.foto_url IS NOT NULL), count(*)
            FROM raw_candidatos c
            LEFT JOIN candidato_fotos f ON f.sq_candidato = c.sq_candidato
            GROUP BY 1 ORDER BY 1
        """)
        cobertura = cur.fetchall()
    conn.close()

    print("\n===== RESUMO =====")
    print(f"subidas nesta rodada : {len(ok)}")
    print(f"erros                : {len(erros)}")
    print(f"fotos sem match na base: {len(fora_da_base)}")

    print("\ncobertura por UF (com_foto / total de candidaturas):")
    ufs_ok, ufs_parcial, ufs_zero = [], [], []
    for uf, com, tot in cobertura:
        marca = "OK   " if com == tot else ("zero " if com == 0 else "parc.")
        print(f"  {marca} {uf}: {com}/{tot}")
        (ufs_ok if com == tot else (ufs_zero if com == 0 else ufs_parcial)).append(uf)

    print(f"\nUFs OK        ({len(ufs_ok)}): {', '.join(ufs_ok) or '—'}")
    print(f"UFs parciais  ({len(ufs_parcial)}): {', '.join(ufs_parcial) or '—'}")
    print(f"UFs SEM foto  ({len(ufs_zero)}): {', '.join(ufs_zero) or '—'}")
    print(f"\n(pastas de foto ausentes localmente: {', '.join(ufs_sem_foto) or '—'})")
    if err_uf:
        print(f"\nerros por UF: {dict(err_uf)}")
        for sq, uf, err in erros[:15]:
            print(f"   {uf} {sq}: {err}")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--dir", default="fotos")
    p.add_argument("--uf", nargs="*", help="filtra por UF do nome do arquivo (ex.: --uf RJ MG BR)")
    p.add_argument("--force", action="store_true", help="re-sobe e regrava quem já tem foto")
    p.add_argument("--concorrencia", type=int, default=6)
    p.add_argument("--dry-run", action="store_true")
    run(p.parse_args())


if __name__ == "__main__":
    main()
