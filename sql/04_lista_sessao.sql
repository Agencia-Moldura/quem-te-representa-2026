-- Passo 5 do front: "lista de opções" do eleitor.
-- A lista de trabalho vive no sessionStorage do navegador; cada item adicionado
-- é TAMBÉM registrado aqui (log append-only) para a base da página.
-- Rodar DEPOIS de 03_grants.sql.

CREATE TABLE IF NOT EXISTS lista_sessao (
    session_id    uuid        NOT NULL,
    sq_candidato  text        NOT NULL,
    uf            text,
    cargo         text,
    nm_urna       text,
    adicionado_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, sq_candidato)
);

CREATE INDEX IF NOT EXISTS idx_lista_sessao_sq ON lista_sessao (sq_candidato);
CREATE INDEX IF NOT EXISTS idx_lista_sessao_dia ON lista_sessao (adicionado_em);

ALTER TABLE lista_sessao ENABLE ROW LEVEL SECURITY;

-- anon pode INSERIR (adicionar à lista) e LER (restaurar a lista da sessão).
-- Sem UPDATE/DELETE: remover da lista mexe só no sessionStorage; a base é log.
DROP POLICY IF EXISTS lista_sessao_insert ON lista_sessao;
CREATE POLICY lista_sessao_insert ON lista_sessao
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS lista_sessao_select ON lista_sessao;
CREATE POLICY lista_sessao_select ON lista_sessao
    FOR SELECT TO anon, authenticated USING (true);

GRANT INSERT, SELECT ON lista_sessao TO anon, authenticated;
