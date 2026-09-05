Cole isto no Claude Code, dentro da pasta deste projeto:

---

Este é um projeto de raspagem + carga no Supabase dos dados de candidaturas do
TSE 2026 (ver README.md para contexto completo). Preciso que você:

1. Instale as dependências (`requirements.txt`) e crie um `.env` a partir do
   `.env.example` (vou preencher a `SUPABASE_DB_URL` manualmente).
2. Rode `python scraper/download_and_load.py` e me mostre o output.
3. Se algum CSV vier com colunas diferentes do que `sql/02_curada.sql` espera
   (isso é esperado - o layout do TSE pode ter mudado em relação a anos
   anteriores), abra `scraper/_leiame/` para consultar o dicionário de dados
   oficial e AJUSTE `sql/02_curada.sql` e `sql/01_indices.sql` para os nomes
   de coluna reais antes de rodar os dois arquivos SQL contra o Supabase.
4. Rode `sql/01_indices.sql` e depois `sql/02_curada.sql` no banco (via
   psycopg2/psql usando a mesma `SUPABASE_DB_URL`).
5. Faça um sanity check: conte linhas de `candidatos`, confira se bate
   aproximadamente com o número de "pedidos de registro" que o TSE divulgou
   para hoje, e rode uma consulta de exemplo agrupando por `ds_cargo`.
6. Me reporte: quantas linhas em cada tabela raw, quantas em `candidatos`,
   e qualquer coluna que teve que ser renomeada por divergência de layout.

Não precisa mexer em nada de "Fase 2" (recursos financeiros de campanha,
votação nominal, cargos anteriores) - isso fica para depois.

---
