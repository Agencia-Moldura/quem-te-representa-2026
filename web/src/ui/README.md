# QTR.UI — biblioteca de componentes

Tradução do **"QTR UI Design System"** (arquivo do Claude Design, em
`web/QTR UI Design System.html`) para componentes React + CSS.

Vitrine viva: **`/design`** (rota fora do shell do app).

## O que já existe

| arquivo | componentes | corresponde a |
|---|---|---|
| `tokens.css` | variáveis `--qtr-*` (cor, tipografia, espaço, raio, sombra) + fontes Google (Poppins/Lato/JetBrains Mono) | seções 01–02 |
| `ui.css` | todas as classes `.qtr-*` | seções 01–09 |
| `Icon.tsx` | `<Icon name>` — jogo de ícones em traço 24×24 | ícones do guia |
| `Button.tsx` | `<Button variant size icon iconRight block>` — `primary` `primary-dark` `outline` `outline-ink` `accent` `ghost` | 03 Botões |
| `Pagination.tsx` | `<Pagination total atual onChange>` | 03 Paginação |
| `Field.tsx` | `<Field label hint help error as>` — envelope rótulo/ajuda | 04 |
| `TextField.tsx` | `<TextField label type value onChange>` | 04 E-mail |
| `SelectField.tsx` | `<SelectField label value onChange options placeholder>` — borda tinta → roxa quando preenchido | 04 Gênero/Faixa |
| `Checkbox.tsx` | `<Checkbox checked onChange>` | 04 "quero novidades" |
| `RadioGroup.tsx` | `<RadioGroup label value onChange options>` | 04 posicionamento |
| `TagToggleGroup.tsx` | `<TagToggleGroup label value onChange options>` — seleção múltipla por **união** | 04 pautas / profissão / escolaridade |
| `OptionCardGroup.tsx` | `<OptionCardGroup label value onChange options plain>` — cartões (com ícone = gênero; `plain` = faixa etária) | 04 escolha visual |
| `SwatchSelectGroup.tsx` | `<SwatchSelectGroup label value onChange options multiple>` — disco de cor + rótulo | 04 / 05 cor/raça |
| `Chip.tsx` | `<Chip onRemove variant>` (`solid` `media` `outline`) + `<ChipGroup>` | 05 removíveis / mídia |
| `StatusBadge.tsx` | `<StatusBadge tone dot>` — `accent` `solid` `warn` `info` `success` `neutral` | 05 status |
| `Stepper.tsx` | `<Stepper steps atual onStepClick>` — passo atual = bolinha cheia + circunferência | 06 |
| `Breadcrumb.tsx` | `<Breadcrumb items>` | 06 |
| `Alert.tsx` | `<Alert tone>` — `neutral` `info` `success` `warn` | 08 |
| `Card.tsx` | `<Card flat padLg>` + `CardIcon` `CardTitle` `CardText` | 07 |

Import único de estilos: `import './ui/index.css'` (traz `tokens.css` + `ui.css`) —
já feito no `main.tsx`, então as classes `.qtr-*` valem em todo o app.
Barril de componentes: `import { Button, SelectField, … } from './ui'`.

## Aplicado (2026-09-06)

O `main.tsx` importa `ui/index.css` antes de tudo. O `style-guide.css` virou uma
**ponte**: os tokens legados (`--color-*`, `--space-*`, `--radius-*`…) agora
apontam para os `--qtr-*`, então o `styles.css` herda a paleta/fontes QTR.

Telas migradas para os componentes:

| onde | usa |
|---|---|
| `components/Stepper` | `ui/Stepper` (5 passos, passo 5 `done` quando há itens na lista) |
| `components/CaminhoHeader` | `Breadcrumb` + `qtr-eyebrow` + `Chip` de contexto |
| `pages/CaminhoPerfil` | `TagToggleGroup` (idade/escolaridade/estado civil), `OptionCardGroup` (gênero), `SwatchSelectGroup` (cor/raça), `SelectField`, `Button`, `Alert` |
| `pages/CaminhoCurriculo` | idem + `Checkbox` (reeleição); `Alert` no lugar do `aviso-fase2` |
| `pages/CaminhoRelacionamento` | `SelectField` (presidência/governo), `Button`, `Chip`, `StatusBadge` |
| `pages/MatchEleitoral2026` | `Button`, `Icon` nos cards de caminho, `qtr-eyebrow` |
| `components/ResultadoLista` | `StatusBadge` (situação), `qtr-chip` (ribbon) |
| `components/FiltroGlobal` | selects reestilizados (CSS) |

`components/Campos.tsx` foi removido (só `Field`/`Select`/`CheckGroup`, tudo
substituído). Listas de opções no formato dos componentes: `lib/opcoes.ts`.

## Ainda pendente

- `Carrinho` (trilho + gaveta) — só herdou tokens, sem refactor de componente.
- `ResultadoLista` — card ainda é CSS próprio; a foto do vice (chapa) entra depois.
- `Pagination` e `TextField` existem mas nenhuma tela usa ainda.

## Notas

- Fontes carregadas por `@import` no topo de `tokens.css` (sem tocar em `index.html`).
- Tudo com prefixo `qtr-` para conviver com o CSS legado sem conflito.
- `SelectField` usa `<select>` nativo (chevron via `background-image` data-URI).
