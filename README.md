# Quem Te Representa — Match Eleitoral 2026

Base pesquisável das candidaturas das Eleições 2026 (dados do TSE), com um front
de "match eleitoral" para o eleitor encontrar candidatos por perfil, currículo ou
relação política.

Fonte: [Portal de Dados Abertos do TSE](https://dadosabertos.tse.jus.br) — dataset
`candidatos-2026` (atualizado 4x/dia).

## Estrutura

```
scraper/   ETL em Python: baixa os ZIPs do TSE, extrai e carrega em tabelas raw_* no Postgres
sql/       camada curada: índices + views (candidatos, patrimonio_por_candidato, coligacoes_executivo)
web/       front em React (Vite + TS) que consome as views via Supabase JS
fotos/     ZIPs de foto do TSE extraídos (NÃO versionado — só a URL vai pro banco)
```

## Banco (Supabase / Postgres)

| Camada | O quê |
|---|---|
| **raw** (`raw_candidatos`, `raw_candidatos_complementar`, `raw_bens_candidato`, `raw_coligacoes`, `raw_vagas`, `raw_motivo_cassacao`, `raw_redes_sociais`) | dump fiel do TSE, tudo `TEXT`, colunas do header real |
| **curada** (views) | `candidatos` (tipada, sem renúncia/indeferido, sem suplentes de senador), `patrimonio_por_candidato`, `coligacoes_executivo` |
| **curadoria manual** | `espectro_coligacao` (esquerda/centro/direita — worksheet em `sql/`), `candidato_fotos` |

Só as 3 views curadas ficam acessíveis pela chave publishable (anon); RLS nas
`raw_*` (`sql/03_grants.sql`).

## Rodar

```bash
# 1. ETL
python -m pip install -r requirements.txt
cp .env.example .env          # preencher SUPABASE_DB_URL
python scraper/download_and_load.py
python scraper/run_sql.py sql/01_indices.sql sql/02_curada.sql sql/03_grants.sql

# 2. Fotos (opcional) — baixar os ZIPs foto_candidato_2026_{UF} do cdn.tse.jus.br,
#    extrair em fotos/, e (com SUPABASE_URL + SUPABASE_SERVICE_KEY no .env):
python scraper/fotos_upload.py

# 3. Front
cd web && cp .env.example .env   # preencher URL + anon key
npm install && npm run dev
```

## Front — `/match-eleitoral-2026`

Barra fixa **Cargo + Estado** (vale para tudo) e três caminhos:

1. **Perfil** — idade, gênero, cor/raça.
2. **Currículo** — profissão (multi, com grupos tipo "Servidor público") e faixa de
   patrimônio (multi). Cargos anteriores = Fase 2.
3. **Relação política** — escolhe presidente + governador → candidatos cujo partido
   está nessas coligações.

Cada card mostra número de urna, partido, foto, dados do registro, "cabeça de chapa
aliada", e é link para o perfil no DivulgaCandContas do TSE.

## Fase 2 (não iniciada)

Recursos financeiros de campanha (cron semanal), votação nominal, cargos anteriores
(cruzamento por CPF entre 2018–2024). Ver histórico no git e comentários nos SQLs.
