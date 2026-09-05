export const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'BR', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS',
  'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE',
  'SP', 'TO',
]

// Suplentes de senador ficam de fora em todo o app (não são candidaturas que
// o eleitor escolhe diretamente).
export const CARGOS_OCULTOS = ['1º SUPLENTE', '2º SUPLENTE']

export const CARGOS = [
  'PRESIDENTE',
  'VICE-PRESIDENTE',
  'GOVERNADOR',
  'VICE-GOVERNADOR',
  'SENADOR',
  'DEPUTADO FEDERAL',
  'DEPUTADO ESTADUAL',
  'DEPUTADO DISTRITAL',
]

export const GENEROS = ['FEMININO', 'MASCULINO', 'NÃO DIVULGÁVEL']

export const CORES_RACA = [
  'BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDÍGENA', 'NÃO DIVULGÁVEL',
]

export const GRAUS_INSTRUCAO = [
  'LÊ E ESCREVE',
  'ENSINO FUNDAMENTAL INCOMPLETO',
  'ENSINO FUNDAMENTAL COMPLETO',
  'ENSINO MÉDIO INCOMPLETO',
  'ENSINO MÉDIO COMPLETO',
  'SUPERIOR INCOMPLETO',
  'SUPERIOR COMPLETO',
  'NÃO DIVULGÁVEL',
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
  prefixo?: string // ilike 'PREFIXO%'
}

export const OCUPACOES_COMUNS: OpcaoOcupacao[] = [
  { id: 'servidor-publico', label: 'Servidor público (todos)', prefixo: 'SERVIDOR PÚBLICO' },
  { id: 'professor', label: 'Professor (todos)', prefixo: 'PROFESSOR' },
  { id: 'empresario', label: 'Empresário', exatos: ['EMPRESÁRIO'] },
  { id: 'advogado', label: 'Advogado', exatos: ['ADVOGADO'] },
  { id: 'deputado', label: 'Deputado', exatos: ['DEPUTADO'] },
  { id: 'vereador', label: 'Vereador', exatos: ['VEREADOR'] },
  { id: 'policial-militar', label: 'Policial militar', exatos: ['POLICIAL MILITAR'] },
  { id: 'policial-civil', label: 'Policial civil', exatos: ['POLICIAL CIVIL'] },
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
