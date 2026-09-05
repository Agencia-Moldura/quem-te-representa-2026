import { supabase } from './supabase'
import { CARGOS_OCULTOS, FAIXAS_PATRIMONIO, OCUPACOES_COMUNS } from './constants'
import type { Ordenacao } from './constants'
import type { Candidato, ColigacaoExecutivo } from '../types'

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

async function run<T>(q: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? ([] as unknown as T))
}

// query base de candidatos: exclui os cargos ocultos (suplentes) sempre.
function baseCandidatos() {
  let q = supabase.from('candidatos').select(COLS)
  for (const cargo of CARGOS_OCULTOS) q = q.neq('ds_cargo', cargo)
  return q
}

// contexto global (Estado + Cargo), aplicado antes dos filtros de cada caminho.
export interface Contexto {
  uf?: string
  cargo?: string
}

// ---------- Caminho 1: perfil ----------
export interface FiltroPerfil extends Contexto {
  idadeMin?: number
  idadeMax?: number
  genero?: string
  corRaca?: string
  ordenar?: Ordenacao
}

export function buscarPorPerfil(f: FiltroPerfil): Promise<Candidato[]> {
  let q = baseCandidatos()
  if (f.uf) q = q.eq('sg_uf', f.uf)
  if (f.cargo) q = q.eq('ds_cargo', f.cargo)
  if (f.genero) q = q.eq('ds_genero', f.genero)
  if (f.corRaca) q = q.eq('ds_cor_raca', f.corRaca)
  if (f.idadeMin != null) q = q.gte('idade', f.idadeMin)
  if (f.idadeMax != null) q = q.lte('idade', f.idadeMax)
  const [col, asc] = ORDER_COL[f.ordenar ?? 'nome']
  return run<Candidato[]>(
    q.order(col, { ascending: asc, nullsFirst: false }).limit(LIMITE).returns<Candidato[]>(),
  )
}

// ---------- Caminho 2: currículo ----------
export interface FiltroCurriculo extends Contexto {
  ocupacoes?: string[]        // ids de OCUPACOES_COMUNS — união
  faixasPatrimonio?: string[] // ids de FAIXAS_PATRIMONIO — união
  reeleicao?: boolean
  ordenar?: Ordenacao
}

// termos PostgREST (para um or()) das ocupações selecionadas
function termosOcupacao(ids: string[]): string[] {
  const t: string[] = []
  for (const id of ids) {
    const op = OCUPACOES_COMUNS.find((o) => o.id === id)
    if (!op) continue
    if (op.prefixo) t.push(`ds_ocupacao.ilike."${op.prefixo}*"`)
    if (op.exatos) t.push(`ds_ocupacao.in.(${op.exatos.map((v) => `"${v}"`).join(',')})`)
  }
  return t
}

// monta o predicado de UMA faixa de patrimônio como termo(s) de um or()
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

export function buscarPorCurriculo(f: FiltroCurriculo): Promise<Candidato[]> {
  let q = baseCandidatos()
  if (f.uf) q = q.eq('sg_uf', f.uf)
  if (f.cargo) q = q.eq('ds_cargo', f.cargo)
  if (f.reeleicao) q = q.eq('st_reeleicao', 'S')

  if (f.ocupacoes && f.ocupacoes.length) {
    const termos = termosOcupacao(f.ocupacoes)
    if (termos.length) q = q.or(termos.join(','))
  }

  if (f.faixasPatrimonio && f.faixasPatrimonio.length) {
    const termos = f.faixasPatrimonio.flatMap(termosFaixa)
    if (termos.length) q = q.or(termos.join(','))
  }

  const [col, asc] = ORDER_COL[f.ordenar ?? 'patrimonio']
  return run<Candidato[]>(
    q.order(col, { ascending: asc, nullsFirst: false }).limit(LIMITE).returns<Candidato[]>(),
  )
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
  cargo?: string,
): Promise<Candidato[]> {
  if (partidos.length === 0) return Promise.resolve([])
  let q = baseCandidatos().eq('sg_uf', uf).in('sg_partido', partidos)
  if (cargo) q = q.eq('ds_cargo', cargo)
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
