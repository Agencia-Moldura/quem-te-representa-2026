-- Segurança da API pública (rodar DEPOIS de 02_curada.sql).
--
-- Por padrão o Supabase concede CRUD completo aos papéis `anon` e `authenticated`
-- em tudo que o `postgres` cria no schema public. Como a chave publishable
-- (anon) fica exposta no JS do front, isso deixaria qualquer visitante
-- APAGAR / TRUNCAR as tabelas. Este portal é só leitura, e só das views curadas.

-- 1) Tira todo acesso de anon/authenticated de tudo em public
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON TABLES FROM anon, authenticated;

-- 2) RLS nas tabelas raw (defense-in-depth: sem policy = invisível via PostgREST).
--    As views são SECURITY DEFINER (dono = postgres, superuser) e continuam lendo
--    as raw normalmente.
ALTER TABLE raw_candidatos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_candidatos_complementar ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_bens_candidato          ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_coligacoes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_vagas                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_motivo_cassacao         ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_redes_sociais           ENABLE ROW LEVEL SECURITY;
ALTER TABLE espectro_coligacao          ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidato_fotos             ENABLE ROW LEVEL SECURITY;

-- 3) Front (anon) e usuários logados leem SOMENTE as views curadas
GRANT SELECT ON candidatos             TO anon, authenticated;
GRANT SELECT ON patrimonio_por_candidato TO anon, authenticated;
GRANT SELECT ON coligacoes_executivo   TO anon, authenticated;

-- service_role (chave secreta do backend) continua com acesso total — não mexer.
