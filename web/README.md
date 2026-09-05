# match eleitoral 2026 — front preliminar

Protótipo React (Vite + TS) que consome as views curadas do Supabase
(`candidatos`, `patrimonio_por_candidato`, `coligacoes_executivo`).
Interface propositalmente crua — vai ser refinada com o Claude Design depois.

## Rodar

```bash
cd web
cp .env.example .env      # preencha URL + anon key do Supabase
npm install
npm run dev
```

## Página `/match-eleitoral-2026`

**Filtro global** (barra fixa do topo, `<FiltroGlobal>`): Cargo + Estado. Fica na
URL (`?cargo=…&uf=…`), vale para os três caminhos e persiste na navegação/reload.
Suplentes de senador são sempre excluídos (`CARGOS_OCULTOS` em `lib/constants.ts`,
aplicado em `lib/api.ts` `baseCandidatos()`).

Três caminhos, cada um herda o cargo+estado do filtro global:

| Caminho | Rota | Filtros próprios |
|---|---|---|
| 1 · Perfil | `…/perfil` | idade, gênero, cor/raça |
| 2 · Currículo | `…/curriculo` | profissão, patrimônio, reeleição. "Eleições anteriores" = Fase 2 |
| 3 · Relacionamento político | `…/relacionamento` | candidatura à presidência + ao governo → candidatos cujo partido está nessas coligações, marcados por alinhamento |

## Dados

- Só leitura, via chave publishable (anon). As tabelas `raw_*` não são acessíveis
  pelo client (ver `../sql/03_grants.sql`).
- `../scraper/download_and_load.py` recarrega os dados; `../sql/*.sql` reconstrói as views.
- **Fotos:** `../scraper/fotos_upload.py` sobe os JPEGs do TSE (pasta `../fotos/`,
  ZIPs `foto_candidato_2026_{UF}` já extraídos) para o bucket público
  `fotos-candidatos` do Supabase Storage e grava a URL em `candidato_fotos.foto_url`,
  que a view `candidatos` expõe como `foto_url`. Requer `SUPABASE_URL` +
  `SUPABASE_SERVICE_KEY` no `../.env`. O card usa `<img onError>` → cai pras iniciais.

## Deploy (Vercel)

Root do projeto = `web/`. Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
`vercel.json` já faz o fallback de SPA para o react-router.
