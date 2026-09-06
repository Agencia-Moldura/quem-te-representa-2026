# Caminhos e filtros

Estado do front em **2026-09-06**. Fonte: `web/src/lib/constants.ts`,
`web/src/lib/opcoes.ts`, `web/src/lib/api.ts`, `web/src/components/` e
`web/src/pages/`.

## Tipos de widget

| tipo | componente | comportamento |
|---|---|---|
| `tags_uniao` | `TagToggleGroup` — pílulas que ligam/desligam | **união (OU)** — traz quem bate em QUALQUER pílula marcada; nada marcado = não filtra. Tem "limpar (N)". |
| `cartoes_unica` | `OptionCardGroup` — cartões (com ícone) | uma escolha; clicar de novo desmarca |
| `swatch_unica` | `SwatchSelectGroup` — pílula com disco de cor | uma escolha; clicar de novo desmarca |
| `select_unico` | `SelectField` — `<select>` nativo estilizado | uma opção; a 1ª ("todas"/"— nenhuma —") = não filtra |
| `checkbox` | `Checkbox` | ligado/desligado |
| `botao_grade` | grade de botões (passo 1, estado) | uma opção; **obrigatório** |
| `ordenacao` | `SelectField` | não filtra — só muda a ordem |

Limite de exibição: **300 resultados**. A contagem mostra "**X de TOTAL**" (X = quem
bate os filtros; TOTAL = universo cargo+estado). No cargo de chapa mostra "**N chapas**".

## Combinar caminhos

São 3 páginas, mas **cada uma tem, na sanfona "Ver mais filtros de …", os filtros
das outras** — dá para somar Perfil+Currículo (1+2) e Currículo+Relacionamento (2+3)
partindo de qualquer página. A busca roda a query certa: se há presidência/governo
escolhidos, filtra também pelos partidos da coligação.

---

## 1. Todos os filtros

### Contexto global (passo 1 e 2 / barra do topo)

#### Estado — `botao_grade` (passo 1) / `select_unico` (barra) · **obrigatório**
`AC AL AM AP BA BR CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO`
(`BR` = candidaturas nacionais / presidência.)

#### Cargo — `select_unico` · opcional · **opções dependem da UF**
- **UF = BR**: `todos os cargos` · `Presidente e vice`
- **UF = estado**: `todos os cargos` · `Governador e vice` · `Senador` · `Deputado federal` · `Deputado estadual` · `Deputado distrital`

`Presidente e vice` / `Governador e vice` são **agregados**: casam os dois `ds_cargo`
e o resultado vira **1 card por chapa** (foto do titular na frente, vice 10° atrás;
clicar troca). Trocar de UF com cargo incompatível limpa o cargo. `1º/2º SUPLENTE`
são sempre ocultos.

### Filtros de candidato

#### Faixa de idade — `tags_uniao`
`Até 25 anos` · `25 a 34 anos` · `35 a 50 anos` · `51 a 70 anos` · `70 anos ou mais`
(limites inclusivos; quem não tem data de nascimento fica de fora ao filtrar).

#### Gênero — `cartoes_unica` (com ícone)
`Feminino` · `Masculino` · `Não divulgável`

#### Cor/raça — `swatch_unica` (disco de cor)
`Branca` · `Preta` · `Parda` · `Amarela` · `Indígena` · `Não divulgável`

#### Escolaridade — `tags_uniao`
`Analfabeto` · `Lê e escreve` · `Fundamental incompleto` · `Fundamental` ·
`Médio incompleto` · `Ensino médio` · `Superior incompleto` · `Ensino superior`

#### Estado civil — `tags_uniao`
`Solteiro(a)` · `Casado(a)` · `Divorciado(a)` · `Viúvo(a)` · `Separado(a) judicialmente`

#### Profissão — `tags_uniao` · **dinâmico** (`FiltroProfissao`)
Só mostra os grupos com candidato no cargo+estado (lê a view `ocupacoes_por_recorte`).
**~50 grupos** cobrindo praticamente toda `ds_ocupacao` com presença relevante — cada
grupo soma variações do TSE:

Servidor público · Parlamentar / chefe de executivo · Juiz / promotor / cartório ·
Policial / bombeiro / militar · Vigilante / segurança privada · Professor / pedagogo ·
Médico · Enfermeiro / técnico de enfermagem · Odontólogo · Farmacêutico · Psicólogo ·
Fisioterapeuta / nutricionista / fono · Veterinário / zootecnista · Agente de saúde /
biomédico · Advogado · Assistente social · Empresário / diretor de empresa ·
Comerciante / feirante · Vendedor / representante comercial · Corretor (imóveis /
seguros) · Administrador · Auxiliar administrativo / escritório · Contador ·
Economista / bancário · Engenheiro · Arquiteto / urbanista · Agrônomo / técnico
agrícola · TI / analista de sistemas · Técnico em eletrônica / telecom · Biólogo /
químico / físico · Jornalista / publicitário / RP · Radialista / locutor · Músico /
cantor · Ator / artista / produtor cultural · Escritor / historiador / cientista
social · Atleta / técnico esportivo · Religioso / sacerdote · Agricultor / produtor
rural · Pescador · Motorista / motoboy / taxista · Construção civil / eletricista ·
Mecânico / metalúrgico · Operário / indústria / gráfica · Cabeleireiro / manicure /
estética · Cozinheiro / padeiro / garçom · Serviços gerais / limpeza / portaria ·
Dona de casa · Estudante / estagiário · Aposentado (não servidor).

#### Faixa de patrimônio — `tags_uniao`
`menos de R$ 100 mil` (inclui quem não declarou bens) · `R$ 100 mil a R$ 500 mil` ·
`R$ 500 mil a R$ 1 milhão` · `R$ 1 milhão a R$ 5 milhões` · `acima de R$ 5 milhões`
(mínimo inclusivo, máximo exclusivo).

#### Concorrendo à reeleição — `checkbox`
`st_reeleicao = S`. ⚠️ Hoje **não retorna nada** — o TSE ainda publica o campo vazio.

#### Situação da candidatura — `select_unico`
`todas` · `candidatura deferida` (status começando com `DEFERIDO`) ·
`aguardando julgamento` (`AGUARDANDO` ou `PENDENTE`).
Renúncia e registro indeferido já ficam fora da base.

#### Ordenar por — `ordenacao` · **nos 3 caminhos**
`nome (A–Z)` · `maior patrimônio` · `menor patrimônio` · `mais velho` · `mais jovem` ·
`maior escolaridade` · `menor escolaridade`
(escolaridade ordena pela coluna `grau_instrucao_ordinal` da view; no Caminho 3
vale dentro de cada cargo, já que o resultado é agrupado.)

#### Presidência — `select_unico` — `— nenhuma —` + 13 candidaturas a presidente
#### Governo de {UF} — `select_unico` — `— nenhuma —` + governadores da UF
Ao escolher uma (ou as duas), filtra pelos **partidos da coligação** daquela
candidatura. Cada card ganha a etiqueta "aliado de {nome} (presidência/governo)".

---

## 2. Como os filtros aparecem em cada caminho

Em todos: **Estado** (obrigatório) e **Cargo** já valem antes de entrar no caminho.
Os filtros abaixo do "Ver mais filtros de …" são **opcionais** e combinam com os
principais.

### Caminho 1 · Perfil
**Principais:** Faixa de idade · Gênero · Cor/raça · Ordenar por (padrão *nome A–Z*) · Buscar
**Ver mais filtros de Perfil:** Escolaridade · Estado civil · **Profissão** ·
**Faixa de patrimônio** · **Concorrendo à reeleição** · Situação da candidatura
→ dá para somar tudo do Currículo (1+2).

### Caminho 2 · Currículo
**Principais:** Profissão (dinâmico) · Faixa de patrimônio · Ordenar por (padrão
*maior patrimônio*) · Concorrendo à reeleição · Buscar
**Ver mais filtros de Currículo:** **Presidência** · **Governo de {UF}** · Faixa de
idade · Escolaridade · Gênero · Cor/raça · Situação da candidatura
→ dá para somar Perfil (1+2) e Relacionamento (2+3). Quando há presidência/governo,
o card ganha a etiqueta de aliado.

### Caminho 3 · Relacionamento político
**Principais:** Presidência · Governo de {UF} (pelo menos uma) · Ordenar por ·
Ver candidatos alinhados
**Ver mais filtros de Relacionamento:** **Profissão** · **Faixa de patrimônio** ·
Faixa de idade · Escolaridade · Gênero · Cor/raça · **Concorrendo à reeleição**
→ dá para somar Currículo (2+3) e Perfil.
Resultado **agrupado por cargo** (a ordenação vale dentro de cada grupo); cada card
com a etiqueta de aliado. Sem "Situação".

---

## 3. Matriz filtro × caminho

| filtro | tipo | Perfil | Currículo | Relacionamento |
|---|---|:---:|:---:|:---:|
| Estado | botao_grade / select_unico | global | global | global |
| Cargo (por UF) | select_unico | global | global | global |
| Faixa de idade | tags_uniao | principal | mais filtros | mais filtros |
| Gênero | cartoes_unica | principal | mais filtros | mais filtros |
| Cor/raça | swatch_unica | principal | mais filtros | mais filtros |
| Escolaridade | tags_uniao | mais filtros | mais filtros | mais filtros |
| Estado civil | tags_uniao | mais filtros | — | — |
| Profissão (dinâmico) | tags_uniao | mais filtros | principal | mais filtros |
| Faixa de patrimônio | tags_uniao | mais filtros | principal | mais filtros |
| Concorrendo à reeleição | checkbox | mais filtros | principal | mais filtros |
| Situação da candidatura | select_unico | mais filtros | mais filtros | — |
| Presidência | select_unico | — | mais filtros | principal |
| Governo de {UF} | select_unico | — | mais filtros | principal |
| Ordenar por | ordenacao | principal | principal | principal |
