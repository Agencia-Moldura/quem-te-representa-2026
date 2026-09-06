# Caminhos e filtros

Estado do front em **2026-09-06**. Fonte: `web/src/lib/constants.ts`,
`web/src/lib/api.ts` e as páginas em `web/src/pages/`.

Tipos de filtro usados:

| tipo | como é | comportamento |
|---|---|---|
| `selecao_multipla_checkbox` | grupo de checkboxes (componente `CheckGroup`) | **união (OU)** — traz quem bate em QUALQUER opção marcada; nada marcado = não filtra |
| `select_unico` | `<select>` de uma opção | uma opção por vez; a 1ª opção ("todos"/"nenhuma") = não filtra |
| `botao_grade` | grade de botões (só o passo 1, estado) | uma opção; obrigatório |
| `checkbox_booleano` | um checkbox só | ligado/desligado |
| `ordenacao` | `<select>` | não filtra — só muda a ordem da lista |

O limite de exibição é **300 resultados** (a contagem mostra "X de TOTAL" — X = quem bate os filtros, TOTAL = universo do cargo+estado).

---

## 1. Todos os filtros

### Contexto global (vale para os 3 caminhos)

Aparece na barra fixa do topo / passos 1 e 2.

#### Estado — `botao_grade` (passo 1) depois `select_unico` (barra)
**Obrigatório.** Sem estado escolhido nada é exibido.
Opções: `AC AL AM AP BA BR CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO`
(`BR` = candidaturas nacionais / presidência.)

#### Cargo — `select_unico`
Opcional. Opções:
`todos os cargos` · `PRESIDENTE` · `VICE-PRESIDENTE` · `GOVERNADOR` · `VICE-GOVERNADOR` · `SENADOR` · `DEPUTADO FEDERAL` · `DEPUTADO ESTADUAL` · `DEPUTADO DISTRITAL`
`1º SUPLENTE` e `2º SUPLENTE` são **sempre ocultos** no app inteiro.

---

### Filtros de candidato (podem ser usados em qualquer caminho)

#### Faixa de idade — `selecao_multipla_checkbox` (união)
Opções: `Até 25 anos` · `25 a 34 anos` · `35 a 50 anos` · `51 a 70 anos` · `70 anos ou mais`
Limites inclusivos; as faixas se sobrepõem nos anos 25 e 70 (sem problema, é união). Idade é calculada da data de nascimento; quem não tem data fica de fora ao filtrar.

#### Gênero — `select_unico`
Opções: `todos` · `FEMININO` · `MASCULINO` · `NÃO DIVULGÁVEL`

#### Cor/raça — `select_unico`
Opções: `todas` · `BRANCA` · `PRETA` · `PARDA` · `AMARELA` · `INDÍGENA` · `NÃO DIVULGÁVEL`

#### Escolaridade — `selecao_multipla_checkbox` (união)
Opções (rótulo → valor no TSE):
`Analfabeto` → ANALFABETO ·
`Lê e escreve` → LÊ E ESCREVE ·
`Fundamental incompleto` → ENSINO FUNDAMENTAL INCOMPLETO ·
`Fundamental` → ENSINO FUNDAMENTAL COMPLETO ·
`Médio incompleto` → ENSINO MÉDIO INCOMPLETO ·
`Ensino médio` → ENSINO MÉDIO COMPLETO ·
`Superior incompleto` → SUPERIOR INCOMPLETO ·
`Ensino superior` → SUPERIOR COMPLETO

#### Estado civil — `selecao_multipla_checkbox` (união)
Opções: `Solteiro(a)` · `Casado(a)` · `Divorciado(a)` · `Viúvo(a)` · `Separado(a) judicialmente`

#### Profissão — `selecao_multipla_checkbox` (união) · **dinâmico**
Só mostra os grupos que **têm ao menos um candidato** no cargo+estado selecionado (não aparece opção que daria zero).
Grupos (alguns somam variações do TSE):

| rótulo | o que agrupa |
|---|---|
| Servidor público (todos) | qualquer `SERVIDOR PÚBLICO *` (estadual, municipal, federal, civil aposentado…) |
| Professor (todos) | qualquer `PROFESSOR *` (ensino médio, fundamental, superior, formação profissional…) |
| Policial / bombeiro / militar | `POLICIAL *`, `BOMBEIRO *`, `MILITAR REFORMADO` |
| Deputado / vereador | `DEPUTADO`, `VEREADOR` |
| Empresário | EMPRESÁRIO |
| Advogado | ADVOGADO |
| Médico | MÉDICO |
| Enfermeiro | ENFERMEIRO |
| Odontólogo | ODONTÓLOGO |
| Comerciante | COMERCIANTE |
| Administrador | ADMINISTRADOR |
| Contador | CONTADOR |
| Engenheiro | ENGENHEIRO |
| Jornalista e redator | JORNALISTA E REDATOR |
| Assistente social | ASSISTENTE SOCIAL |
| Agricultor | AGRICULTOR |
| Dona de casa | DONA DE CASA |
| Estudante / estagiário | ESTUDANTE, BOLSISTA, ESTAGIÁRIO E ASSEMELHADOS |
| Aposentado (não servidor) | APOSENTADO (EXCETO SERVIDOR PÚBLICO) |

#### Faixa de patrimônio — `selecao_multipla_checkbox` (união)
Soma dos bens declarados no registro. Opções:
`menos de R$ 100 mil` (inclui quem **não declarou bens**) ·
`R$ 100 mil a R$ 500 mil` ·
`R$ 500 mil a R$ 1 milhão` ·
`R$ 1 milhão a R$ 5 milhões` ·
`acima de R$ 5 milhões`
(mínimo inclusivo, máximo exclusivo.)

#### Concorrendo à reeleição — `checkbox_booleano`
Filtra `st_reeleicao = S`. ⚠️ Hoje **não retorna nada** — o TSE ainda publica esse campo vazio (`#NE`). Deve popular mais perto do pleito.

#### Situação da candidatura — `select_unico`
Opções:
`todas` ·
`candidatura deferida` → status começando com `DEFERIDO` (inclui "deferido em prazo recursal") ·
`aguardando julgamento` → `AGUARDANDO JULGAMENTO` ou `PENDENTE DE JULGAMENTO`
Obs.: candidaturas com **renúncia** ou **registro indeferido** já são removidas da base, então não aparecem em nenhum filtro.

#### Ordenar por — `ordenacao` (`select_unico`, não filtra)
Opções: `nome (A–Z)` · `maior patrimônio` · `mais jovem` · `mais velho`

---

### Filtros exclusivos do Caminho 3 (Relacionamento político)

#### Presidência — `select_unico`
Opcional. Opções: `— nenhuma —` + as 13 candidaturas a presidente, no formato `nº · Nome · PARTIDO`.

#### Governo de {UF} — `select_unico`
Opcional. Opções: `— nenhuma —` + as candidaturas a governador da UF escolhida, no formato `nº · Nome · PARTIDO — Coligação`.

É preciso escolher **pelo menos uma** das duas (presidência e/ou governo).

---

## 2. Como os filtros aparecem em cada caminho

Em todos: **Estado** (obrigatório, passo 1) e **Cargo** (opcional, barra do topo) já estão aplicados antes de entrar no caminho.

### Caminho 1 · Perfil
> "Idade, gênero e cor/raça autodeclarados no registro."

**Filtros principais (visíveis):**
- Faixa de idade — `selecao_multipla_checkbox`
- Gênero — `select_unico`
- Cor/raça — `select_unico`
- Ordenar por — `ordenacao` (padrão: **nome (A–Z)**)

**Sanfona "Ver mais filtros de Perfil":**
- Escolaridade — `selecao_multipla_checkbox`
- Estado civil — `selecao_multipla_checkbox`
- Situação da candidatura — `select_unico`

---

### Caminho 2 · Currículo
> "Profissão declarada e patrimônio. Marque quantas opções quiser — o filtro é por união."

**Filtros principais (visíveis):**
- Profissão — `selecao_multipla_checkbox` (dinâmico: só grupos com candidato no recorte)
- Faixa de patrimônio — `selecao_multipla_checkbox`
- Ordenar por — `ordenacao` (padrão: **maior patrimônio**)
- Concorrendo à reeleição — `checkbox_booleano`

**Sanfona "Ver mais filtros de Currículo":**
- Faixa de idade — `selecao_multipla_checkbox`
- Escolaridade — `selecao_multipla_checkbox`
- Gênero — `select_unico`
- Cor/raça — `select_unico`
- Situação da candidatura — `select_unico`

> "Eleições anteriores / cargos já exercidos" aparece como aviso — ainda **não é filtro** (Fase 2).

---

### Caminho 3 · Relacionamento político
> "Diga em quem você pensa em votar para presidência e para o governo do seu estado. Listamos os candidatos cujo partido integra a coligação de uma dessas candidaturas."

**Filtros principais (visíveis):**
- Presidência — `select_unico` (opcional)
- Governo de {UF} — `select_unico` (opcional)
- (escolher ao menos uma das duas)

**Sanfona "Ver mais filtros de Relacionamento":**
- Faixa de idade — `selecao_multipla_checkbox`
- Escolaridade — `selecao_multipla_checkbox`
- Gênero — `select_unico`
- Cor/raça — `select_unico`

O resultado vem **agrupado por cargo** e cada card recebe uma etiqueta ("aliado de {nome} (presidência/governo)"). Não tem "Ordenar por" nem "Situação" neste caminho.

---

## Resumo — matriz filtro × caminho

| filtro | tipo | Perfil | Currículo | Relacionamento |
|---|---|:---:|:---:|:---:|
| Estado | botao_grade / select_unico | global | global | global |
| Cargo | select_unico | global | global | global |
| Faixa de idade | selecao_multipla_checkbox | principal | mais filtros | mais filtros |
| Gênero | select_unico | principal | mais filtros | mais filtros |
| Cor/raça | select_unico | principal | mais filtros | mais filtros |
| Escolaridade | selecao_multipla_checkbox | mais filtros | mais filtros | mais filtros |
| Estado civil | selecao_multipla_checkbox | mais filtros | — | — |
| Situação da candidatura | select_unico | mais filtros | mais filtros | — |
| Profissão | selecao_multipla_checkbox (dinâmico) | — | principal | — |
| Faixa de patrimônio | selecao_multipla_checkbox | — | principal | — |
| Concorrendo à reeleição | checkbox_booleano | — | principal | — |
| Presidência | select_unico | — | — | principal |
| Governo de {UF} | select_unico | — | — | principal |
| Ordenar por | ordenacao | principal | principal | — |
