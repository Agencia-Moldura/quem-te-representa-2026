import type { Candidato } from '../types'

const brlFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function brl(v: number | null | undefined): string {
  return v == null ? '—' : brlFmt.format(v)
}

// dados do TSE vêm em CAIXA ALTA. Title-case pt-BR, mantendo conectivos minúsculos.
const MINUSCULAS = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'di', 'du', 'com', 'em'])

export function titulo(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .toLocaleLowerCase('pt-BR')
    .split(/(\s+|-|\/)/)
    .map((p, i) => {
      if (/^(\s+|-|\/)$/.test(p) || p === '') return p
      if (i > 0 && MINUSCULAS.has(p)) return p
      return p.charAt(0).toLocaleUpperCase('pt-BR') + p.slice(1)
    })
    .join('')
}

export function nomeExibicao(c: Candidato): string {
  return titulo(c.nm_urna_candidato || c.nm_candidato)
}

// Perfil público da candidatura no DivulgaCandContas do TSE.
// O 2º segmento (idEleicao) muda a cada eleição — se o link cair em 404,
// confira 1 candidatura no site do TSE e ajuste TSE_ID_ELEICAO.
const TSE_ID_ELEICAO = {
  federal: '2040602026', // Presidente / Vice-Presidente (cd_eleicao 6257)
  estadual: '2040602026', // Governador, Senador, Deputados, suplentes (6259)
}

export function urlPerfilTse(c: Candidato): string {
  const federal = c.ds_cargo === 'PRESIDENTE' || c.ds_cargo === 'VICE-PRESIDENTE'
  const id = federal ? TSE_ID_ELEICAO.federal : TSE_ID_ELEICAO.estadual
  return `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/2026/${id}/${c.sg_uf}/${c.sq_candidato}`
}

export function iniciais(nome: string): string {
  const ps = titulo(nome).split(/\s+/).filter((p) => p.length > 2)
  if (ps.length === 0) return '?'
  return (ps[0][0] + (ps.length > 1 ? ps[ps.length - 1][0] : '')).toUpperCase()
}

// rótulo curto pra <option>: "13 · Lula · PT"
export function rotuloOpcao(c: Candidato): string {
  const partes = [c.nr_candidato, nomeExibicao(c), c.sg_partido].filter(Boolean)
  return partes.join(' · ')
}

// "PDT / FEDERAÇÃO PSDB CIDADANIA (PSDB / CIDADANIA)" -> ["PDT","PSDB","CIDADANIA"]
export function siglasDaComposicao(composicao: string | null | undefined): string[] {
  if (!composicao) return []
  const out = new Set<string>()
  for (const parte of composicao.split('/')) {
    const t = parte.replace(/[()]/g, '').trim()
    if (!t) continue
    if (t.startsWith('FEDERAÇÃO ')) continue // é o nome da federação, não uma sigla
    out.add(t)
  }
  return [...out]
}
