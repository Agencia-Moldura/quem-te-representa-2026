"""
Roda arquivos .sql contra o Postgres do Supabase usando a mesma SUPABASE_DB_URL
do .env (evita depender do psql instalado no Windows).

Uso:
    python scraper/run_sql.py sql/01_indices.sql sql/02_curada.sql
"""

from __future__ import annotations

import os
import sys

import psycopg2
from dotenv import load_dotenv

load_dotenv()


def run(paths: list[str]) -> None:
    db_url = os.environ.get("SUPABASE_DB_URL")
    if not db_url:
        sys.exit("Defina SUPABASE_DB_URL no .env (veja .env.example)")

    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    try:
        for path in paths:
            with open(path, "r", encoding="utf-8") as fh:
                sql = fh.read()
            print(f"\n=== {path} ===")
            with conn.cursor() as cur:
                cur.execute(sql)
                # imprime NOTICE/mensagens do servidor, se houver
                for notice in conn.notices:
                    print(notice.strip())
                conn.notices.clear()
            print("ok")
    finally:
        conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("informe pelo menos um arquivo .sql")
    run(sys.argv[1:])
