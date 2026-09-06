export const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'BR', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS',
  'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE',
  'SP', 'TO',
]

// Suplentes de senador ficam de fora em todo o app (não são candidaturas que
// o eleitor escolhe diretamente).
export const CARGOS_OCULTOS = ['1º SUPLENTE', '2º SUPLENTE']

// Opções do seletor de cargo. Presidente/governador aparecem agregados com o
// respectivo vice ("chapa"): o filtro casa os dois ds_cargo e o card mostra as
// duas fotos. `value` é o que vai na URL (?cargo=).
export interface OpcaoCargo {
  value: string
  label: string
  cargos: string[] // ds_cargo reais no banco
  chapa?: boolean // titular + vice pareados por nr_candidato
}

export const CARGOS: OpcaoCargo[] = [
  { value: 'PRESIDENTE E VICE', label: 'Presidente e vice', cargos: ['PRESIDENTE', 'VICE-PRESIDENTE'], chapa: true },
  { value: 'GOVERNADOR E VICE', label: 'Governador e vice', cargos: ['GOVERNADOR', 'VICE-GOVERNADOR'], chapa: true },
  { value: 'SENADOR', label: 'Senador', cargos: ['SENADOR'] },
  { value: 'DEPUTADO FEDERAL', label: 'Deputado federal', cargos: ['DEPUTADO FEDERAL'] },
  { value: 'DEPUTADO ESTADUAL', label: 'Deputado estadual', cargos: ['DEPUTADO ESTADUAL'] },
  { value: 'DEPUTADO DISTRITAL', label: 'Deputado distrital', cargos: ['DEPUTADO DISTRITAL'] },
]

const CARGO_POR_VALOR = new Map(CARGOS.map((c) => [c.value, c]))

/** ds_cargo reais para um valor do seletor (ex.: "GOVERNADOR E VICE" → 2 cargos) */
export function cargosDoValor(value: string): string[] {
  return CARGO_POR_VALOR.get(value)?.cargos ?? [value]
}

/** o valor do seletor agrega titular + vice? */
export function ehChapa(value: string | undefined): boolean {
  return !!value && CARGO_POR_VALOR.get(value)?.chapa === true
}

/** rótulo curto para exibir (fallback: o próprio valor em title-case simples) */
export function rotuloCargo(value: string | undefined): string {
  if (!value) return 'todos os cargos'
  return CARGO_POR_VALOR.get(value)?.label ?? value
}

// prefixo de ds_cargo que indica "vice" (a chapa é titular + vice)
export const PREFIXO_VICE = 'VICE-'

export const GENEROS = ['FEMININO', 'MASCULINO', 'NÃO DIVULGÁVEL']

export const CORES_RACA = [
  'BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDÍGENA', 'NÃO DIVULGÁVEL',
]

// [valor exato no banco, rótulo curto]
export const GRAUS_INSTRUCAO: [string, string][] = [
  ['ANALFABETO', 'Analfabeto'],
  ['LÊ E ESCREVE', 'Lê e escreve'],
  ['ENSINO FUNDAMENTAL INCOMPLETO', 'Fundamental incompleto'],
  ['ENSINO FUNDAMENTAL COMPLETO', 'Fundamental'],
  ['ENSINO MÉDIO INCOMPLETO', 'Médio incompleto'],
  ['ENSINO MÉDIO COMPLETO', 'Ensino médio'],
  ['SUPERIOR INCOMPLETO', 'Superior incompleto'],
  ['SUPERIOR COMPLETO', 'Ensino superior'],
]

export const ESTADOS_CIVIS: [string, string][] = [
  ['SOLTEIRO(A)', 'Solteiro(a)'],
  ['CASADO(A)', 'Casado(a)'],
  ['DIVORCIADO(A)', 'Divorciado(a)'],
  ['VIÚVO(A)', 'Viúvo(a)'],
  ['SEPARADO(A) JUDICIALMENTE', 'Separado(a) judicialmente'],
]

export const SITUACOES: { id: '' | 'deferido' | 'aguardando'; label: string }[] = [
  { id: '', label: 'todas' },
  { id: 'deferido', label: 'candidatura deferida' },
  { id: 'aguardando', label: 'aguardando julgamento' },
]

// faixas de idade (multi-seleção, união). min/max inclusivos.
export interface FaixaIdade {
  id: string
  label: string
  min?: number
  max?: number
}

export const FAIXAS_IDADE: FaixaIdade[] = [
  { id: 'ate-25', label: 'Até 25 anos', max: 25 },
  { id: '25-34', label: '25 a 34 anos', min: 25, max: 34 },
  { id: '35-50', label: '35 a 50 anos', min: 35, max: 50 },
  { id: '51-70', label: '51 a 70 anos', min: 51, max: 70 },
  { id: '70-mais', label: '70 anos ou mais', min: 70 },
]

export type Ordenacao = 'nome' | 'patrimonio' | 'idade_asc' | 'idade_desc'

export const ORDENACOES: { id: Ordenacao; label: string }[] = [
  { id: 'nome', label: 'nome (A–Z)' },
  { id: 'patrimonio', label: 'maior patrimônio' },
  { id: 'idade_asc', label: 'mais jovem' },
  { id: 'idade_desc', label: 'mais velho' },
]

// faixas de patrimônio declarado. min inclusivo, max exclusivo.
// "semBens": inclui quem não declarou bens (valor_total_bens NULL).
export interface FaixaPatrimonio {
  id: string
  label: string
  min?: number
  max?: number
  semBens?: boolean
}

export const FAIXAS_PATRIMONIO: FaixaPatrimonio[] = [
  { id: 'ate-100k', label: 'menos de R$ 100 mil', max: 100_000, semBens: true },
  { id: '100k-500k', label: 'R$ 100 mil a R$ 500 mil', min: 100_000, max: 500_000 },
  { id: '500k-1mi', label: 'R$ 500 mil a R$ 1 milhão', min: 500_000, max: 1_000_000 },
  { id: '1mi-5mi', label: 'R$ 1 milhão a R$ 5 milhões', min: 1_000_000, max: 5_000_000 },
  { id: 'acima-5mi', label: 'acima de R$ 5 milhões', min: 5_000_000 },
]

// Opções do filtro de profissão (multi-seleção, união). Cada opção casa por
// valores EXATOS de ds_ocupacao (conferidos no banco) ou por prefixo — o prefixo
// agrupa variações (ex.: "Servidor público" = estadual + municipal + federal + …).
export interface OpcaoOcupacao {
  id: string
  label: string
  exatos?: string[]
  prefixos?: string[] // ilike 'PREFIXO%' (qualquer um)
}

export const OCUPACOES_COMUNS: OpcaoOcupacao[] = [
  { id: 'servidor-publico', label: 'Servidor público (todos)', prefixos: ['SERVIDOR PÚBLICO'] },
  { id: 'professor', label: 'Professor (todos)', prefixos: ['PROFESSOR'] },
  {
    id: 'seguranca',
    label: 'Policial / bombeiro / militar',
    prefixos: ['POLICIAL', 'BOMBEIRO'],
    exatos: ['MILITAR REFORMADO'],
  },
  {
    id: 'parlamentar',
    label: 'Deputado / vereador',
    exatos: ['DEPUTADO', 'VEREADOR'],
  },
  { id: 'empresario', label: 'Empresário', exatos: ['EMPRESÁRIO'] },
  { id: 'advogado', label: 'Advogado', exatos: ['ADVOGADO'] },
  { id: 'medico', label: 'Médico', exatos: ['MÉDICO'] },
  { id: 'enfermeiro', label: 'Enfermeiro', exatos: ['ENFERMEIRO'] },
  { id: 'odontologo', label: 'Odontólogo', exatos: ['ODONTÓLOGO'] },
  { id: 'comerciante', label: 'Comerciante', exatos: ['COMERCIANTE'] },
  { id: 'administrador', label: 'Administrador', exatos: ['ADMINISTRADOR'] },
  { id: 'contador', label: 'Contador', exatos: ['CONTADOR'] },
  { id: 'engenheiro', label: 'Engenheiro', exatos: ['ENGENHEIRO'] },
  { id: 'jornalista', label: 'Jornalista e redator', exatos: ['JORNALISTA E REDATOR'] },
  { id: 'assistente-social', label: 'Assistente social', exatos: ['ASSISTENTE SOCIAL'] },
  { id: 'agricultor', label: 'Agricultor', exatos: ['AGRICULTOR'] },
  { id: 'dona-de-casa', label: 'Dona de casa', exatos: ['DONA DE CASA'] },
  {
    id: 'estudante',
    label: 'Estudante / estagiário',
    exatos: ['ESTUDANTE, BOLSISTA, ESTAGIÁRIO E ASSEMELHADOS'],
  },
  {
    id: 'aposentado',
    label: 'Aposentado (não servidor)',
    exatos: ['APOSENTADO (EXCETO SERVIDOR PÚBLICO)'],
  },
]
