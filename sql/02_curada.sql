-- Camada curada, usada pelo front (v0 + Supabase JS client).
-- Não consulte as tabelas raw_* diretamente do front: consulte estas views.
--
-- AJUSTADO ao layout REAL de 2026 (arquivos gerados em 05/09/2026, conferidos
-- contra scraper/_leiame/candidatos__leiame.pdf e .../candidatos_complementar__leiame.pdf).
-- Divergências em relação ao layout histórico usado no rascunho original:
--
--   * ST_REELEICAO saiu de consulta_cand e agora vive em
--     consulta_cand_complementar (chave sq_candidato). Puxado via LEFT JOIN
--     abaixo. Obs.: em 05/09/2026 o TSE ainda publica esse campo como '#NE'
--     (não preenchido); tratado como NULL aqui. Deve popular mais perto do pleito.
--   * DS_SITUACAO_CANDIDATURA continua existindo em consulta_cand mas o TSE marca
--     "Aplicável somente para os registros das eleições até 2022" e de fato vem
--     '#NE' em todas as linhas de 2026. O campo de status vivo agora é
--     DS_SITUACAO_JULGAMENTO (em complementar): DEFERIDO / INDEFERIDO /
--     AGUARDANDO JULGAMENTO / RENÚNCIA / ... Exposto como ds_situacao_julgamento.
--   * NM_EMAIL virou DS_EMAIL (não usado por esta view).
--   * Nenhuma mudança em bem_candidato: sq_candidato e vr_bem_candidato batem.
--
--   * NR_CPF_CANDIDATO foi REMOVIDO desta view: ela é servida ao front via a
--     chave pública (anon) do Supabase e o próprio leiame do TSE trata CPF como
--     dado não divulgável. Para o cruzamento de "cargos anteriores" da Fase 2,
--     leia o CPF de raw_candidatos direto (conexão service_role / psycopg2).

-- CREATE OR REPLACE não permite remover/reordenar colunas de uma view; dropa antes.
DROP VIEW IF EXISTS candidatos CASCADE;
DROP VIEW IF EXISTS patrimonio_por_candidato CASCADE;
DROP VIEW IF EXISTS coligacoes_executivo CASCADE;

-- 0) Fotos das candidaturas — só a URL pública (imagem não é baixada/armazenada).
--    Populada por scraper/fotos_tse.py (API DivulgaCandContas). Começa vazia;
--    a view `candidatos` faz LEFT JOIN. Reexecutável preserva os dados.
CREATE TABLE IF NOT EXISTS candidato_fotos (
    sq_candidato       text PRIMARY KEY,
    ano_eleicao        text,
    sg_ue              text,   -- unidade eleitoral (UF, ou 'BR' p/ presidente)
    cd_cargo           text,
    foto_url           text,   -- NULL = tentamos e o TSE não tinha foto
    origem             text,   -- 'listar' | 'buscar' | 'nao_encontrado'
    foto_atualizada_em timestamptz,
    tentado_em         timestamptz DEFAULT now()
);

-- 1) Patrimônio total por candidato (soma dos bens declarados)
CREATE OR REPLACE VIEW patrimonio_por_candidato AS
SELECT
    sq_candidato,
    COUNT(*)                                                     AS qtd_bens,
    SUM(
        NULLIF(
            REPLACE(REPLACE(vr_bem_candidato, '.', ''), ',', '.'),
            ''
        )::NUMERIC
    ) AS valor_total_bens
FROM raw_bens_candidato
GROUP BY sq_candidato;

-- 2) View principal de candidatos, tipada e pronta para filtro
CREATE OR REPLACE VIEW candidatos AS
SELECT
    c.sq_candidato,
    c.nr_candidato,
    c.nm_candidato,
    c.nm_urna_candidato,
    c.sg_uf,
    c.sg_ue,
    c.nm_ue,
    c.ds_cargo,
    c.sg_partido,
    c.nm_partido,
    -- agremiação / coligação (para o caminho "relacionamento político").
    -- nm_coligacao só faz sentido quando há coligação de fato — pra partido
    -- isolado / federação o TSE repete o rótulo do tipo, que não é nome de coligação.
    c.tp_agremiacao,
    CASE WHEN c.tp_agremiacao = 'COLIGAÇÃO' THEN c.sq_coligacao END          AS sq_coligacao,
    CASE WHEN c.tp_agremiacao = 'COLIGAÇÃO' THEN TRIM(c.nm_coligacao) END    AS nm_coligacao,
    CASE WHEN c.tp_agremiacao = 'COLIGAÇÃO'
         THEN TRIM(c.ds_composicao_coligacao) END                           AS ds_composicao_coligacao,
    c.ds_situacao_candidatura,                                   -- legado: '#NE' em 2026
    NULLIF(cc.ds_situacao_julgamento, '#NE')                     AS ds_situacao_julgamento,
    c.ds_genero,
    c.ds_grau_instrucao,
    c.ds_estado_civil,
    c.ds_cor_raca,
    c.ds_ocupacao,
    NULLIF(NULLIF(cc.st_reeleicao, '#NE'), 'Não divulgável')     AS st_reeleicao,
    -- datas do TSE vêm como texto DD/MM/AAAA
    TO_DATE(NULLIF(c.dt_nascimento, ''), 'DD/MM/YYYY')           AS dt_nascimento,
    DATE_PART(
        'year',
        AGE(CURRENT_DATE, TO_DATE(NULLIF(c.dt_nascimento, ''), 'DD/MM/YYYY'))
    )::INT                                                        AS idade,
    cf.foto_url,
    p.valor_total_bens,
    p.qtd_bens
FROM raw_candidatos c
LEFT JOIN raw_candidatos_complementar cc
    ON cc.sq_candidato = c.sq_candidato
LEFT JOIN patrimonio_por_candidato p
    ON p.sq_candidato = c.sq_candidato
LEFT JOIN candidato_fotos cf
    ON cf.sq_candidato = c.sq_candidato
-- não exibe candidaturas que saíram da disputa: renúncia ou registro indeferido.
-- (as linhas continuam em raw_candidatos para eventual análise.)
WHERE COALESCE(NULLIF(cc.ds_situacao_julgamento, '#NE'), 'DEFERIDO') NOT IN (
    'RENÚNCIA',
    'INDEFERIDO',
    'INDEFERIDO EM PRAZO RECURSAL OU COM RECURSO'
);

-- 3) Espectro político por coligação (esquerda/centro/direita).
--    Tabela CURADA À MÃO — o TSE não publica isso. Preencher com
--    sql/espectro_coligacao.seed.sql (worksheet gerado com todas as coligações
--    de Governador/Presidente). Começa vazia; a view abaixo faz LEFT JOIN.
CREATE TABLE IF NOT EXISTS espectro_coligacao (
    sq_coligacao text PRIMARY KEY,
    sg_uf        text,
    nm_coligacao text,
    espectro     text CHECK (espectro IN
                   ('esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita')),
    observacao   text
);

-- 4) Coligações dos cargos do Executivo (Governador / Presidente): qual partido
--    integra qual coligação, por UF. Usada pelo caminho "relacionamento político"
--    para achar os candidatos alinhados a uma candidatura ao governo/presidência.
CREATE OR REPLACE VIEW coligacoes_executivo AS
SELECT DISTINCT
    rc.sg_uf,
    rc.ds_cargo,
    rc.sq_coligacao,
    NULLIF(NULLIF(TRIM(rc.nm_coligacao), 'PARTIDO ISOLADO'), 'FEDERAÇÃO')  AS nm_coligacao,
    TRIM(rc.ds_composicao_coligacao)                  AS ds_composicao_coligacao,
    rc.sg_partido,
    rc.nm_partido,
    rc.ds_situacao,
    ec.espectro,
    ec.observacao                                     AS espectro_obs
FROM raw_coligacoes rc
LEFT JOIN espectro_coligacao ec ON ec.sq_coligacao = rc.sq_coligacao
WHERE rc.ds_cargo IN ('GOVERNADOR', 'PRESIDENTE');

-- 5) Ocupações declaradas por (estado, cargo). O front usa isso para só oferecer
--    opções de profissão que existem no recorte. Query direta em `candidatos`
--    seria truncada pelo max-rows do PostgREST (1000); a view distinta é pequena.
CREATE OR REPLACE VIEW ocupacoes_por_recorte AS
SELECT DISTINCT sg_uf, ds_cargo, ds_ocupacao
FROM candidatos
WHERE ds_ocupacao IS NOT NULL
  AND ds_ocupacao <> 'NÃO DIVULGÁVEL'
  AND ds_ocupacao <> '#NE';

-- Sanity check sugerido depois de rodar:
-- SELECT COUNT(*) FROM candidatos;
-- SELECT ds_cargo, COUNT(*) FROM candidatos GROUP BY 1 ORDER BY 2 DESC;
