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
  nacional?: boolean // só existe para UF = BR (presidência)
}

export const CARGOS: OpcaoCargo[] = [
  { value: 'PRESIDENTE E VICE', label: 'Presidente e vice', cargos: ['PRESIDENTE', 'VICE-PRESIDENTE'], chapa: true, nacional: true },
  { value: 'GOVERNADOR E VICE', label: 'Governador e vice', cargos: ['GOVERNADOR', 'VICE-GOVERNADOR'], chapa: true },
  { value: 'SENADOR', label: 'Senador', cargos: ['SENADOR'] },
  { value: 'DEPUTADO FEDERAL', label: 'Deputado federal', cargos: ['DEPUTADO FEDERAL'] },
  { value: 'DEPUTADO ESTADUAL', label: 'Deputado estadual', cargos: ['DEPUTADO ESTADUAL'] },
  { value: 'DEPUTADO DISTRITAL', label: 'Deputado distrital', cargos: ['DEPUTADO DISTRITAL'] },
]

const CARGO_POR_VALOR = new Map(CARGOS.map((c) => [c.value, c]))

/** opções de cargo válidas para a UF: BR só tem presidência; UF só tem o resto */
export function cargosParaUf(uf: string | undefined): OpcaoCargo[] {
  return CARGOS.filter((c) => (uf === 'BR' ? c.nacional : !c.nacional))
}

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

export type Ordenacao =
  | 'nome'
  | 'patrimonio_desc'
  | 'patrimonio_asc'
  | 'idade_desc'
  | 'idade_asc'
  | 'escolaridade_desc'
  | 'escolaridade_asc'

export const ORDENACOES: { id: Ordenacao; label: string }[] = [
  { id: 'nome', label: 'nome (A–Z)' },
  { id: 'patrimonio_desc', label: 'maior patrimônio' },
  { id: 'patrimonio_asc', label: 'menor patrimônio' },
  { id: 'idade_desc', label: 'mais velho' },
  { id: 'idade_asc', label: 'mais jovem' },
  { id: 'escolaridade_desc', label: 'maior escolaridade' },
  { id: 'escolaridade_asc', label: 'menor escolaridade' },
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
// A lista cobre praticamente todas as ocupações declaradas com presença relevante;
// as que não existem para o cargo/estado escolhido são escondidas na tela.
export interface OpcaoOcupacao {
  id: string
  label: string
  exatos?: string[]
  prefixos?: string[] // ilike 'PREFIXO%' (qualquer um)
}

/** o grupo de ocupação tem candidato entre os `valores` (ds_ocupacao) do recorte? */
export function grupoOcupacaoExiste(op: OpcaoOcupacao, valores: string[]): boolean {
  if ((op.exatos ?? []).some((v) => valores.includes(v))) return true
  return (op.prefixos ?? []).some((p) => valores.some((v) => v.startsWith(p)))
}

export const OCUPACOES_COMUNS: OpcaoOcupacao[] = [
  // --- setor público / política ---
  { id: 'servidor-publico', label: 'Servidor público', prefixos: ['SERVIDOR PÚBLICO'], exatos: ['OCUPANTE DE CARGO EM COMISSÃO', 'MINISTRO DE ESTADO', 'DIPLOMATA'] },
  {
    id: 'parlamentar',
    label: 'Parlamentar / chefe de executivo',
    exatos: ['DEPUTADO', 'VEREADOR', 'SENADOR', 'GOVERNADOR', 'PREFEITO'],
  },
  {
    id: 'juridico-estado',
    label: 'Juiz / promotor / cartório',
    exatos: ['MAGISTRADO', 'MEMBRO DO MINISTÉRIO PÚBLICO', 'SERVENTUÁRIO DE JUSTIÇA', 'TABELIÃO'],
  },

  // --- segurança ---
  {
    id: 'seguranca',
    label: 'Policial / bombeiro / militar',
    prefixos: ['POLICIAL', 'BOMBEIRO'],
    exatos: ['MILITAR REFORMADO', 'MEMBRO DAS FORÇAS ARMADAS', 'DETETIVE PARTICULAR'],
  },
  { id: 'vigilante', label: 'Vigilante / segurança privada', exatos: ['VIGILANTE', 'SALVA-VIDAS'] },

  // --- educação ---
  { id: 'professor', label: 'Professor / pedagogo', prefixos: ['PROFESSOR'], exatos: ['PEDAGOGO', 'DIRETOR DE ESTABELECIMENTO DE ENSINO'] },

  // --- saúde ---
  { id: 'medico', label: 'Médico', exatos: ['MÉDICO'] },
  { id: 'enfermeiro', label: 'Enfermeiro / técnico de enfermagem', exatos: ['ENFERMEIRO', 'TÉCNICO DE ENFERMAGEM E ASSEMELHADOS (EXCETO ENFERMEIRO)'] },
  { id: 'odontologo', label: 'Odontólogo', exatos: ['ODONTÓLOGO', 'PROTÉTICO'] },
  { id: 'farmaceutico', label: 'Farmacêutico', exatos: ['FARMACÊUTICO'] },
  { id: 'psicologo', label: 'Psicólogo', exatos: ['PSICÓLOGO'] },
  {
    id: 'fisioterapeuta',
    label: 'Fisioterapeuta / nutricionista / fono',
    exatos: ['FISIOTERAPEUTA E TERAPEUTA OCUPACIONAL', 'NUTRICIONISTA E ASSEMELHADOS', 'FONOAUDIÓLOGO', 'TERAPEUTA'],
  },
  { id: 'veterinario', label: 'Veterinário / zootecnista', exatos: ['VETERINÁRIO', 'ZOOTECNISTA'] },
  { id: 'saude-agente', label: 'Agente de saúde / biomédico', exatos: ['AGENTE DE SAÚDE E SANITARISTA', 'BIOMÉDICO'] },

  // --- direito e social ---
  { id: 'advogado', label: 'Advogado', exatos: ['ADVOGADO'] },
  { id: 'assistente-social', label: 'Assistente social', exatos: ['ASSISTENTE SOCIAL'] },

  // --- negócios / comércio / administração ---
  { id: 'empresario', label: 'Empresário / diretor de empresa', exatos: ['EMPRESÁRIO', 'DIRETOR DE EMPRESAS', 'INDUSTRIAL', 'CAPITALISTA DE ATIVOS FINANCEIROS'] },
  { id: 'comerciante', label: 'Comerciante / feirante', exatos: ['COMERCIANTE', 'FEIRANTE, AMBULANTE E MASCATE'] },
  {
    id: 'vendedor',
    label: 'Vendedor / representante comercial',
    exatos: [
      'VENDEDOR DE COMÉRCIO VAREJISTA E ATACADISTA',
      'VENDEDOR PRACISTA, REPRESENTANTE, CAIXEIRO-VIAJANTE E ASSEMELHADOS',
      'REPRESENTANTE COMERCIAL',
      'COMERCIÁRIO',
      'SUPERVISOR, INSPETOR E AGENTE DE COMPRAS E VENDAS',
    ],
  },
  { id: 'corretor', label: 'Corretor (imóveis / seguros)', exatos: ['CORRETOR DE IMÓVEIS, SEGUROS, TÍTULOS E VALORES', 'SECURITÁRIO'] },
  { id: 'administrador', label: 'Administrador', exatos: ['ADMINISTRADOR'] },
  {
    id: 'administrativo',
    label: 'Auxiliar administrativo / escritório',
    exatos: ['AUXILIAR DE ESCRITÓRIO E ASSEMELHADOS', 'AGENTE ADMINISTRATIVO', 'SECRETÁRIO E DATILÓGRAFO', 'GERENTE', 'RECEPCIONISTA', 'DESPACHANTE', 'DIGITADOR'],
  },
  { id: 'contador', label: 'Contador', exatos: ['CONTADOR', 'TÉCNICO CONTABILIDADE, ESTATÍSTICA, ECONOMIA DOMÉSTICA E ADMINISTRAÇÃO'] },
  { id: 'economista', label: 'Economista / bancário', exatos: ['ECONOMISTA', 'BANCÁRIO E ECONOMIÁRIO'] },

  // --- engenharia / técnica / TI ---
  { id: 'engenheiro', label: 'Engenheiro', exatos: ['ENGENHEIRO'] },
  { id: 'arquiteto', label: 'Arquiteto / urbanista', exatos: ['ARQUITETO'] },
  { id: 'agronomo', label: 'Agrônomo / técnico agrícola', exatos: ['AGRÔNOMO', 'TÉCNICO EM AGRONOMIA E AGRIMENSURA'] },
  { id: 'ti', label: 'TI / analista de sistemas', exatos: ['ANALISTA DE SISTEMAS', 'TÉCNICO EM INFORMÁTICA', 'PROGRAMADOR DE COMPUTADOR', 'OPERADOR DE COMPUTADOR'] },
  { id: 'tecnico-eletronica', label: 'Técnico em eletrônica / telecom', exatos: ['TÉCNICO DE ELETRICIDADE, ELETRÔNICA E TELECOMUNICAÇÕES'] },
  { id: 'ciencias', label: 'Biólogo / químico / físico', exatos: ['BIÓLOGO', 'QUÍMICO', 'FÍSICO', 'GEÓLOGO', 'GEÓGRAFO', 'ESTATÍSTICO'] },

  // --- comunicação / cultura ---
  { id: 'jornalista', label: 'Jornalista / publicitário / RP', exatos: ['JORNALISTA E REDATOR', 'PUBLICITÁRIO', 'RELAÇÕES-PÚBLICAS', 'COMUNICÓLOGO'] },
  { id: 'radialista', label: 'Radialista / locutor', exatos: ['LOCUTOR E COMENTARISTA DE RÁDIO E TELEVISÃO E RADIALISTA', 'OPERADOR DE EQUIPAMENTO DE RÁDIO, TELEVISÃO, SOM E CINEMA'] },
  { id: 'musico', label: 'Músico / cantor', exatos: ['MÚSICO', 'CANTOR E COMPOSITOR'] },
  {
    id: 'artista',
    label: 'Ator / artista / produtor cultural',
    exatos: ['ATOR E DIRETOR DE ESPETÁCULOS PÚBLICOS', 'PRODUTOR DE ESPETÁCULOS PÚBLICOS', 'ARTISTA PLÁSTICO E ASSEMELHADOS', 'ESCULTOR E PINTOR', 'FOTÓGRAFO E ASSEMELHADOS', 'COREÓGRAFO E BAILARINO', 'MODELO', 'ARTISTA DE CIRCO'],
  },
  {
    id: 'escritor',
    label: 'Escritor / historiador / cientista social',
    exatos: ['ESCRITOR E CRÍTICO', 'HISTORIADOR', 'SOCIÓLOGO', 'CIENTISTA POLÍTICO', 'ANTROPÓLOGO', 'ARQUEÓLOGO', 'TRADUTOR, INTÉRPRETE E FILÓLOGO', 'BIBLIOTECÁRIO', 'ARQUIVISTA E MUSEÓLOGO'],
  },
  { id: 'atleta', label: 'Atleta / técnico esportivo', exatos: ['ATLETA PROFISSIONAL E TÉCNICO EM DESPORTOS'] },
  { id: 'religioso', label: 'Religioso / sacerdote', exatos: ['SACERDOTE OU MEMBRO DE ORDEM OU SEITA RELIGIOSA'] },

  // --- rural / pesca ---
  {
    id: 'agricultor',
    label: 'Agricultor / produtor rural',
    exatos: ['AGRICULTOR', 'TRABALHADOR RURAL', 'PRODUTOR AGROPECUÁRIO', 'PECUARISTA', 'OPERADOR DE IMPLEMENTO DE AGRICULTURA, PECUÁRIA E EXPLORAÇÃO FLORESTAL', 'GARIMPEIRO'],
  },
  { id: 'pescador', label: 'Pescador', exatos: ['PESCADOR', 'MARINHEIRO CIVIL, CANOEIRO, EMBARCADO E ASSEMELHADOS'] },

  // --- transporte ---
  {
    id: 'motorista',
    label: 'Motorista / motoboy / taxista',
    exatos: ['MOTORISTA DE VEÍCULOS DE TRANSPORTE COLETIVO DE PASSAGEIROS', 'MOTORISTA PARTICULAR', 'MOTORISTA DE VEÍCULOS DE TRANSPORTE DE CARGA', 'MOTOBOY', 'TAXISTA', 'COBRADOR DE TRANSPORTE COLETIVO'],
  },

  // --- ofícios / operário ---
  {
    id: 'construcao',
    label: 'Construção civil / eletricista',
    exatos: ['TRABALHADOR DE CONSTRUÇÃO CIVIL', 'ELETRICISTA E ASSEMELHADOS', 'CARPINTEIRO, MARCENEIRO E ASSEMELHADOS', 'ENCANADOR, SOLDADOR, CHAPEADOR E CALDEIREIRO', 'SERRALHEIRO', 'TÉCNICO DE OBRAS CIVIS, ESTRADAS, SANEAMENTO E ASSEMELHADOS', 'TÉCNICO EM EDIFICAÇÕES', 'MONTADOR DE ESTRUTURA METÁLICA'],
  },
  {
    id: 'mecanico',
    label: 'Mecânico / metalúrgico',
    exatos: ['MECÂNICO DE MANUTENÇÃO', 'TÉCNICO DE MECÂNICA', 'TORNEIRO MECÂNICO', 'TRABALHADOR METALÚRGICO E SIDERÚRGICO', 'LANTERNEIRO E PINTOR DE VEÍCULOS', 'FUNILEIRO', 'MONTADOR DE MÁQUINAS'],
  },
  { id: 'industria', label: 'Operário / indústria / gráfica', exatos: ['OPERADOR DE APARELHOS DE PRODUÇÃO INDUSTRIAL', 'TRABALHADOR DE ARTES GRÁFICAS'] },
  {
    id: 'artesao',
    label: 'Artesão / costureiro',
    exatos: ['ARTESÃO', 'ALFAIATE E COSTUREIRO', 'TRABALHADOR DE FABRICAÇÃO DE ROUPAS', 'FIANDEIRO, TECELÃO, TINGIDOR E ASSEMELHADOS'],
  },

  // --- serviços ---
  { id: 'beleza', label: 'Cabeleireiro / manicure / estética', exatos: ['CABELEIREIRO E BARBEIRO', 'MANICURE E MAQUILADOR', 'ESTETICISTA', 'MASSAGISTA'] },
  {
    id: 'alimentacao',
    label: 'Cozinheiro / padeiro / garçom',
    exatos: ['COZINHEIRO', 'PADEIRO, CONFEITEIRO E ASSEMELHADOS', 'GARÇOM', 'ATENDENTE DE LANCHONETE E RESTAURANTE', 'TRABALHADOR DE FABRICAÇÃO E PREPARAÇÃO DE ALIMENTOS E BEBIDAS'],
  },
  {
    id: 'servicos-gerais',
    label: 'Serviços gerais / limpeza / portaria',
    exatos: ['PORTEIRO DE EDIFÍCIO, ASCENSORISTA, GARAGISTA E ZELADOR', 'FAXINEIRO', 'GARI OU LIXEIRO', 'JARDINEIRO', 'EMPREGADO DOMÉSTICO', 'CATADOR DE RECICLÁVEIS', 'LAVADOR DE VEÍCULOS', 'FRENTISTA'],
  },

  // --- sem ocupação remunerada / aposentadoria / estudo ---
  { id: 'dona-de-casa', label: 'Dona de casa', exatos: ['DONA DE CASA'] },
  { id: 'estudante', label: 'Estudante / estagiário', exatos: ['ESTUDANTE, BOLSISTA, ESTAGIÁRIO E ASSEMELHADOS'] },
  { id: 'aposentado', label: 'Aposentado (não servidor)', exatos: ['APOSENTADO (EXCETO SERVIDOR PÚBLICO)'] },
]
