import { supabase } from './supabase'
import {
  CARGOS_OCULTOS,
  cargosDoValor,
  FAIXAS_IDADE,
  FAIXAS_PATRIMONIO,
  OCUPACOES_COMUNS,
} from './constants'
import type { Ordenacao } from './constants'
import type { Candidato, ColigacaoExecutivo } from '../types'

// resultado de uma busca:
//  - lista: candidatos (limitada a LIMITE)
//  - totalFiltrado: quantos batem os filtros do caminho
//  - total: universo (cargo + estado), antes dos filtros do caminho
export interface ResultadoBusca {
  lista: Candidato[]
  totalFiltrado: number
  total: number
}

// [coluna, ascendente] para cada ordenação
const ORDER_COL: Record<Ordenacao, [string, boolean]> = {
  nome: ['nm_urna_candidato', true],
  patrimonio: ['valor_total_bens', false],
  idade_asc: ['idade', true],
  idade_desc: ['idade', false],
}

const COLS = [
  'sq_candidato', 'nr_candidato', 'nm_candidato', 'nm_urna_candidato', 'sg_uf',
  'nm_ue', 'ds_cargo', 'sg_partido', 'nm_partido', 'tp_agremiacao',
  'sq_coligacao', 'nm_coligacao', 'ds_composicao_coligacao',
  'ds_situacao_julgamento', 'ds_genero', 'ds_grau_instrucao', 'ds_estado_civil',
  'ds_cor_raca', 'ds_ocupacao', 'st_reeleicao', 'dt_nascimento', 'idade',
  'foto_url', 'valor_total_bens', 'qtd_bens',
].join(',')

const LIMITE = 300

// aplica o filtro de cargo: valor simples → .eq; agregado (chapa) → .in
function aplicarCargo<
  T extends { eq(col: string, val: string): T; in(col: string, vals: readonly string[]): T },
>(q: T, cargo: string | undefined): T {
  if (!cargo) return q
  const reais = cargosDoValor(cargo)
  return reais.length > 1 ? q.in('ds_cargo', reais) : q.eq('ds_cargo', reais[0] ?? cargo)
}

async function run<T>(q: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? ([] as unknown as T))
}

async function runComContagem(
  q: PromiseLike<{ data: Candidato[] | null; error: { message: string } | null; count: number | null }>,
): Promise<{ lista: Candidato[]; count: number }> {
  const { data, error, count } = await q
  if (error) throw new Error(error.message)
  return { lista: data ?? [], count: count ?? 0 }
}

// query base de candidatos: exclui os cargos ocultos (suplentes) sempre.
// count:'exact' -> a resposta traz também o total que bate os filtros.
function baseCandidatos() {
  let q = supabase.from('candidatos').select(COLS, { count: 'exact' })
  for (const cargo of CARGOS_OCULTOS) q = q.neq('ds_cargo', cargo)
  return q
}

// contexto global (Estado + Cargo), aplicado antes dos filtros de cada caminho.
export interface Contexto {
  uf?: string
  cargo?: string
}

// ocupações (ds_ocupacao) que existem para o cargo+estado — p/ não mostrar
// opção de filtro que daria zero. Lê a view `ocupacoes_por_recorte` (distinct
// sg_uf/ds_cargo/ds_ocupacao) — pequena, não bate no limite de linhas do
// PostgREST como uma query direta em `candidatos` bateria.
export async function ocupacoesDisponiveis(ctx: Contexto): Promise<string[]> {
  let q = supabase.from('ocupacoes_por_recorte').select('ds_ocupacao')
  for (const cargo of CARGOS_OCULTOS) q = q.neq('ds_cargo', cargo)
  if (ctx.uf) q = q.eq('sg_uf', ctx.uf)
  q = aplicarCargo(q, ctx.cargo)
  q = q.limit(2000)
  const rows = await run<{ ds_ocupacao: string }[]>(q.returns<{ ds_ocupacao: string }[]>())
  return [...new Set(rows.map((r) => r.ds_ocupacao))]
}

// total do universo (cargo + estado), antes dos filtros do caminho — p/ "N de TOTAL".
// GET com limit(1) em vez de HEAD: o count vem no header Content-Range do mesmo
// jeito, e evita o net::ERR_ABORTED que o Chrome loga em respostas HEAD.
async function contarBase(ctx: Contexto): Promise<number> {
  let q = supabase.from('candidatos').select('sq_candidato', { count: 'exact' })
  for (const cargo of CARGOS_OCULTOS) q = q.neq('ds_cargo', cargo)
  if (ctx.uf) q = q.eq('sg_uf', ctx.uf)
  q = aplicarCargo(q, ctx.cargo)
  const { count, error } = await q.limit(1)
  if (error) throw new Error(error.message)
  return count ?? 0
}

// ---------- filtros de candidato (compartilhados pelos caminhos) ----------
export interface FiltroCandidatos extends Contexto {
  faixasIdade?: string[]       // ids de FAIXAS_IDADE — união
  genero?: string
  corRaca?: string
  escolaridades?: string[]     // valores exatos de ds_grau_instrucao — união
  estadosCivis?: string[]      // valores exatos de ds_estado_civil — união
  ocupacoes?: string[]         // ids de OCUPACOES_COMUNS — união
  faixasPatrimonio?: string[]  // ids de FAIXAS_PATRIMONIO — união
  reeleicao?: boolean
  situacao?: 'deferido' | 'aguardando' | ''
  ordenar?: Ordenacao
}

// aliases pra retrocompat
export type FiltroPerfil = FiltroCandidatos
export type FiltroCurriculo = FiltroCandidatos

function termosIdade(ids: string[]): string[] {
  const t: string[] = []
  for (const id of ids) {
    const fx = FAIXAS_IDADE.find((x) => x.id === id)
    if (!fx) continue
    if (fx.min != null && fx.max != null) t.push(`and(idade.gte.${fx.min},idade.lte.${fx.max})`)
    else if (fx.min != null) t.push(`idade.gte.${fx.min}`)
    else if (fx.max != null) t.push(`idade.lte.${fx.max}`)
  }
  return t
}

function termosOcupacao(ids: string[]): string[] {
  const t: string[] = []
  for (const id of ids) {
    const op = OCUPACOES_COMUNS.find((o) => o.id === id)
    if (!op) continue
    for (const p of op.prefixos ?? []) t.push(`ds_ocupacao.ilike."${p}*"`)
    if (op.exatos) t.push(`ds_ocupacao.in.(${op.exatos.map((v) => `"${v}"`).join(',')})`)
  }
  return t
}

function termosFaixa(id: string): string[] {
  const fx = FAIXAS_PATRIMONIO.find((x) => x.id === id)
  if (!fx) return []
  const t: string[] = []
  if (fx.min != null && fx.max != null) {
    t.push(`and(valor_total_bens.gte.${fx.min},valor_total_bens.lt.${fx.max})`)
  } else if (fx.min != null) {
    t.push(`valor_total_bens.gte.${fx.min}`)
  } else if (fx.max != null) {
    t.push(`valor_total_bens.lt.${fx.max}`)
  }
  if (fx.semBens) t.push('valor_total_bens.is.null')
  return t
}

// aplica todos os filtros de FiltroCandidatos numa query já com base
type Q = ReturnType<typeof baseCandidatos>
function aplicarFiltros(q: Q, f: FiltroCandidatos): Q {
  if (f.uf) q = q.eq('sg_uf', f.uf)
  q = aplicarCargo(q, f.cargo)
  if (f.genero) q = q.eq('ds_genero', f.genero)
  if (f.corRaca) q = q.eq('ds_cor_raca', f.corRaca)
  if (f.reeleicao) q = q.eq('st_reeleicao', 'S')
  if (f.escolaridades?.length) q = q.in('ds_grau_instrucao', f.escolaridades)
  if (f.estadosCivis?.length) q = q.in('ds_estado_civil', f.estadosCivis)
  if (f.situacao === 'deferido') q = q.ilike('ds_situacao_julgamento', 'DEFERIDO%')
  if (f.situacao === 'aguardando') {
    q = q.or('ds_situacao_julgamento.ilike.*AGUARDANDO*,ds_situacao_julgamento.ilike.*PENDENTE*')
  }
  if (f.faixasIdade?.length) {
    const t = termosIdade(f.faixasIdade)
    if (t.length) q = q.or(t.join(','))
  }
  if (f.ocupacoes?.length) {
    const t = termosOcupacao(f.ocupacoes)
    if (t.length) q = q.or(t.join(','))
  }
  if (f.faixasPatrimonio?.length) {
    const t = f.faixasPatrimonio.flatMap(termosFaixa)
    if (t.length) q = q.or(t.join(','))
  }
  return q
}

export async function buscarCandidatos(f: FiltroCandidatos): Promise<ResultadoBusca> {
  const q = aplicarFiltros(baseCandidatos(), f)
  const [col, asc] = ORDER_COL[f.ordenar ?? 'nome']
  const [{ lista, count }, total] = await Promise.all([
    runComContagem(q.order(col, { ascending: asc, nullsFirst: false }).limit(LIMITE).returns<Candidato[]>()),
    contarBase(f),
  ])
  return { lista, totalFiltrado: count, total }
}

// ---------- Caminho 3: relacionamento político ----------
export function presidentes(): Promise<Candidato[]> {
  return run<Candidato[]>(
    supabase
      .from('candidatos')
      .select(COLS)
      .eq('ds_cargo', 'PRESIDENTE')
      .order('nm_urna_candidato')
      .returns<Candidato[]>(),
  )
}

export function governadoresDaUf(uf: string): Promise<Candidato[]> {
  return run<Candidato[]>(
    supabase
      .from('candidatos')
      .select(COLS)
      .eq('sg_uf', uf)
      .eq('ds_cargo', 'GOVERNADOR')
      .order('nm_urna_candidato')
      .returns<Candidato[]>(),
  )
}

export function partidosDaColigacao(sqColigacao: string): Promise<ColigacaoExecutivo[]> {
  return run<ColigacaoExecutivo[]>(
    supabase
      .from('coligacoes_executivo')
      .select(
        'sg_uf,ds_cargo,sq_coligacao,nm_coligacao,ds_composicao_coligacao,sg_partido,nm_partido,ds_situacao,espectro,espectro_obs',
      )
      .eq('sq_coligacao', sqColigacao)
      .order('sg_partido')
      .returns<ColigacaoExecutivo[]>(),
  )
}

// Partidos (siglas) da coligação de um candidato ao Executivo. Sem coligação
// formal (partido isolado) => só o próprio partido.
export async function siglasDaCandidatura(c: Candidato): Promise<{ siglas: string[]; espectro: string | null }> {
  if (c.sq_coligacao) {
    const linhas = await partidosDaColigacao(c.sq_coligacao)
    const siglas = [...new Set(linhas.map((l) => l.sg_partido).filter((s): s is string => !!s))]
    const espectro = linhas.find((l) => l.espectro)?.espectro ?? null
    if (siglas.length) return { siglas, espectro }
  }
  return { siglas: c.sg_partido ? [c.sg_partido] : [], espectro: null }
}

export function candidatosAlinhados(
  uf: string,
  partidos: string[],
  extra: FiltroCandidatos = {},
): Promise<Candidato[]> {
  if (partidos.length === 0) return Promise.resolve([])
  let q = aplicarFiltros(baseCandidatos(), { ...extra, uf })
  q = q.in('sg_partido', partidos)
  return run<Candidato[]>(
    q.order('ds_cargo').order('nm_urna_candidato').limit(600).returns<Candidato[]>(),
  )
}

// --- cabeças de chapa (governador / presidente) por partido, p/ mostrar no card ---
export interface CabecaChapa {
  sq_candidato: string
  nm_candidato: string
  nm_urna_candidato: string | null
  sg_uf: string
  sg_partido: string | null
  nm_coligacao: string | null
  foto_url: string | null
  ds_cargo: string
  partidos: string[] // siglas da coligação (ou só a própria, se isolado)
}

export interface RelacoesExecutivas {
  governadores: CabecaChapa[] // de todas as UFs consultadas
  presidentes: CabecaChapa[]
}

const CHAPA_COLS =
  'sq_candidato,nm_candidato,nm_urna_candidato,sg_uf,sg_partido,sq_coligacao,nm_coligacao,foto_url,ds_cargo'

export async function relacoesExecutivas(ufs: string[]): Promise<RelacoesExecutivas> {
  const ufList = [...new Set(ufs.filter(Boolean))]

  const govsRaw = ufList.length
    ? await run<(Candidato & { foto_url: string | null })[]>(
        supabase
          .from('candidatos')
          .select(CHAPA_COLS)
          .eq('ds_cargo', 'GOVERNADOR')
          .in('sg_uf', ufList)
          .returns<(Candidato & { foto_url: string | null })[]>(),
      )
    : []
  const presRaw = await run<(Candidato & { foto_url: string | null })[]>(
    supabase
      .from('candidatos')
      .select(CHAPA_COLS)
      .eq('ds_cargo', 'PRESIDENTE')
      .returns<(Candidato & { foto_url: string | null })[]>(),
  )

  const sqColigs = [
    ...new Set([...govsRaw, ...presRaw].map((c) => c.sq_coligacao).filter((s): s is string => !!s)),
  ]
  const coligRows = sqColigs.length
    ? await run<ColigacaoExecutivo[]>(
        supabase
          .from('coligacoes_executivo')
          .select('sq_coligacao,sg_partido')
          .in('sq_coligacao', sqColigs)
          .returns<ColigacaoExecutivo[]>(),
      )
    : []
  const partidosPorSq = new Map<string, Set<string>>()
  for (const r of coligRows) {
    if (!r.sq_coligacao || !r.sg_partido) continue
    if (!partidosPorSq.has(r.sq_coligacao)) partidosPorSq.set(r.sq_coligacao, new Set())
    partidosPorSq.get(r.sq_coligacao)!.add(r.sg_partido)
  }

  const enrich = (c: Candidato & { foto_url: string | null }): CabecaChapa => ({
    sq_candidato: c.sq_candidato,
    nm_candidato: c.nm_candidato,
    nm_urna_candidato: c.nm_urna_candidato,
    sg_uf: c.sg_uf,
    sg_partido: c.sg_partido,
    nm_coligacao: c.nm_coligacao,
    foto_url: c.foto_url,
    ds_cargo: c.ds_cargo,
    partidos: c.sq_coligacao
      ? [...(partidosPorSq.get(c.sq_coligacao) ?? [])]
      : c.sg_partido
        ? [c.sg_partido]
        : [],
  })

  return { governadores: govsRaw.map(enrich), presidentes: presRaw.map(enrich) }
}
