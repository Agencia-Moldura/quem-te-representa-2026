-- Rodar DEPOIS de scraper/download_and_load.py ter criado as tabelas raw_*.
-- Conferido contra o layout REAL de 2026 (headers dos arquivos gerados em
-- 05/09/2026 + scraper/_leiame/). Todas as colunas indexadas abaixo existem.
-- Única adição vs. rascunho original: índice em raw_candidatos_complementar
-- (sq_candidato), porque a view `candidatos` agora faz JOIN nessa tabela para
-- puxar st_reeleicao / ds_situacao_julgamento (ver sql/02_curada.sql).

CREATE INDEX IF NOT EXISTS idx_raw_candidatos_sq
  ON raw_candidatos (sq_candidato);

CREATE INDEX IF NOT EXISTS idx_raw_candidatos_uf_cargo
  ON raw_candidatos (sg_uf, ds_cargo);

CREATE INDEX IF NOT EXISTS idx_raw_candidatos_escolaridade
  ON raw_candidatos (ds_grau_instrucao);

CREATE INDEX IF NOT EXISTS idx_raw_candidatos_ocupacao
  ON raw_candidatos (ds_ocupacao);

-- CPF: divulgado para a maioria dos candidatos em 2026 (alguns vêm '-4' =
-- não divulgável). Útil para o cruzamento de "cargos anteriores" da Fase 2.
CREATE INDEX IF NOT EXISTS idx_raw_candidatos_cpf
  ON raw_candidatos (nr_cpf_candidato);

CREATE INDEX IF NOT EXISTS idx_raw_cand_compl_sq
  ON raw_candidatos_complementar (sq_candidato);

CREATE INDEX IF NOT EXISTS idx_raw_bens_sq
  ON raw_bens_candidato (sq_candidato);
