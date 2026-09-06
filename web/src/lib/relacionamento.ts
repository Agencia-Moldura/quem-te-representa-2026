import { useEffect, useMemo, useState } from 'react'
import { governadoresDaUf, presidentes, siglasDaCandidatura } from './api'
import { nomeExibicao } from './format'
import type { Candidato } from '../types'

export interface EscolhaExec {
  cand: Candidato
  siglas: string[]
  espectro: string | null
}

/**
 * Estado + carga das candidaturas ao Executivo (presidência + governo da UF) e
 * a resolução para a lista de partidos da(s) coligação(ões). Usado no caminho 3
 * (filtro principal) e nas sanfonas dos caminhos 1 e 2.
 */
export function useRelacionamento(uf: string) {
  const [presis, setPresis] = useState<Candidato[]>([])
  const [govs, setGovs] = useState<Candidato[]>([])
  const [presSq, setPresSq] = useState('')
  const [govSq, setGovSq] = useState('')

  useEffect(() => {
    presidentes().then(setPresis).catch(() => setPresis([]))
  }, [])

  useEffect(() => {
    setGovs([])
    setGovSq('')
    if (!uf) return
    governadoresDaUf(uf).then(setGovs).catch(() => setGovs([]))
  }, [uf])

  const pres = useMemo(() => presis.find((p) => p.sq_candidato === presSq) ?? null, [presis, presSq])
  const gov = useMemo(() => govs.find((g) => g.sq_candidato === govSq) ?? null, [govs, govSq])

  async function resolver(): Promise<{ partidos: string[]; escolhas: EscolhaExec[] }> {
    const escolhas: EscolhaExec[] = []
    if (pres) escolhas.push({ cand: pres, ...(await siglasDaCandidatura(pres)) })
    if (gov) escolhas.push({ cand: gov, ...(await siglasDaCandidatura(gov)) })
    const partidos = [...new Set(escolhas.flatMap((e) => e.siglas))]
    return { partidos, escolhas }
  }

  /** fábrica de rótulos "aliado de X (presidência/governo)" para um candidato */
  function chipsAlinhamento(escolhas: EscolhaExec[]) {
    return (c: Candidato): string[] => {
      const tags: string[] = []
      for (const e of escolhas) {
        if (!e.siglas.includes(c.sg_partido ?? '')) continue
        const papel = e.cand.ds_cargo.includes('PRESIDENTE') ? 'presidência' : 'governo'
        tags.push(`aliado de ${nomeExibicao(e.cand)} (${papel})`)
      }
      return tags
    }
  }

  return {
    presis,
    govs,
    presSq,
    setPresSq,
    govSq,
    setGovSq,
    temEscolha: !!(pres || gov),
    resolver,
    chipsAlinhamento,
  }
}
