import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { CheckGroup, Field, Select } from '../components/Campos'
import { MaisFiltros } from '../components/MaisFiltros'
import { ResultadoLista } from '../components/ResultadoLista'
import {
  candidatosAlinhados,
  governadoresDaUf,
  presidentes,
  siglasDaCandidatura,
} from '../lib/api'
import { CORES_RACA, FAIXAS_IDADE, GENEROS, GRAUS_INSTRUCAO } from '../lib/constants'
import { useContexto } from '../lib/contexto'
import { nomeExibicao, rotuloOpcao, titulo } from '../lib/format'
import type { Candidato } from '../types'

const OP_IDADE = FAIXAS_IDADE.map((f) => ({ value: f.id, label: f.label }))
const OP_GRAU = GRAUS_INSTRUCAO.map(([v, l]) => ({ value: v, label: l }))

interface Escolha {
  cand: Candidato
  siglas: string[]
  espectro: string | null
}

export function CaminhoRelacionamento() {
  const { uf, cargo } = useContexto()

  const [presis, setPresis] = useState<Candidato[]>([])
  const [govs, setGovs] = useState<Candidato[]>([])
  const [presSq, setPresSq] = useState('')
  const [govSq, setGovSq] = useState('')

  const [presEscolha, setPresEscolha] = useState<Escolha | null>(null)
  const [govEscolha, setGovEscolha] = useState<Escolha | null>(null)
  const [resultado, setResultado] = useState<Candidato[] | null>(null)

  // mais filtros
  const [faixasIdade, setFaixasIdade] = useState<string[]>([])
  const [genero, setGenero] = useState('')
  const [corRaca, setCorRaca] = useState('')
  const [escolaridades, setEscolaridades] = useState<string[]>([])

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    presidentes().then(setPresis).catch((e) => setErro(String(e)))
  }, [])

  useEffect(() => {
    setGovs([])
    setGovSq('')
    setResultado(null)
    setPresEscolha(null)
    setGovEscolha(null)
    if (!uf) return
    governadoresDaUf(uf).then(setGovs).catch((e) => setErro(String(e)))
  }, [uf])

  async function buscar() {
    setErro(null)
    setResultado(null)
    const pres = presis.find((p) => p.sq_candidato === presSq) ?? null
    const gov = govs.find((g) => g.sq_candidato === govSq) ?? null
    if (!pres && !gov) {
      setErro('Escolha ao menos uma candidatura (presidência e/ou governo).')
      return
    }
    setCarregando(true)
    try {
      const pe = pres ? { cand: pres, ...(await siglasDaCandidatura(pres)) } : null
      const ge = gov ? { cand: gov, ...(await siglasDaCandidatura(gov)) } : null
      setPresEscolha(pe)
      setGovEscolha(ge)

      const uniao = [...new Set([...(pe?.siglas ?? []), ...(ge?.siglas ?? [])])]
      setResultado(
        await candidatosAlinhados(uf, uniao, {
          cargo: cargo || undefined,
          faixasIdade,
          genero: genero || undefined,
          corRaca: corRaca || undefined,
          escolaridades,
        }),
      )
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro')
    } finally {
      setCarregando(false)
    }
  }

  function alinhamentosDe(c: Candidato): string[] {
    const tags: string[] = []
    if (presEscolha?.siglas.includes(c.sg_partido ?? '')) {
      tags.push(`aliado de ${nomeExibicao(presEscolha.cand)} (presidência)`)
    }
    if (govEscolha?.siglas.includes(c.sg_partido ?? '')) {
      tags.push(`aliado de ${nomeExibicao(govEscolha.cand)} (governo)`)
    }
    return tags
  }

  if (!uf) return <Navigate to="/match-eleitoral-2026" replace />

  return (
    <section>
      <CaminhoHeader
        n="3"
        titulo="Relacionamento político"
        sub="Diga em quem você pensa em votar para presidência e para o governo do seu estado. Listamos os candidatos cujo partido integra a coligação de uma dessas candidaturas (ou das duas)."
      />

      <div className="filtros filtros-rel">
          <Field label="Presidência" hint="(opcional)">
            <select className="field-select" value={presSq} onChange={(e) => setPresSq(e.target.value)}>
              <option value="">— nenhuma —</option>
              {presis.map((p) => (
                <option key={p.sq_candidato} value={p.sq_candidato}>
                  {rotuloOpcao(p)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={`Governo de ${uf}`} hint="(opcional)">
            <select className="field-select" value={govSq} onChange={(e) => setGovSq(e.target.value)}>
              <option value="">— nenhuma —</option>
              {govs.map((g) => (
                <option key={g.sq_candidato} value={g.sq_candidato}>
                  {rotuloOpcao(g)}{g.nm_coligacao ? ` — ${g.nm_coligacao}` : ''}
                </option>
              ))}
            </select>
          </Field>

          <button className="btn-buscar" type="button" onClick={buscar} disabled={carregando}>
            {carregando ? 'Buscando…' : 'Ver candidatos alinhados'}
          </button>

          <MaisFiltros caminho="Relacionamento">
            <CheckGroup label="Faixa de idade" hint="(qualquer uma)" options={OP_IDADE}
              selected={faixasIdade} onChange={setFaixasIdade} />
            <CheckGroup label="Escolaridade" hint="(qualquer uma)" options={OP_GRAU}
              selected={escolaridades} onChange={setEscolaridades} />
            <div className="filtros-rodape">
              <Field label="Gênero">
                <Select value={genero} onChange={setGenero} options={GENEROS} placeholder="todos" />
              </Field>
              <Field label="Cor/raça">
                <Select value={corRaca} onChange={setCorRaca} options={CORES_RACA} placeholder="todas" />
              </Field>
            </div>
          </MaisFiltros>
      </div>

      {erro && <p className="erro">{erro}</p>}

      {(presEscolha || govEscolha) && (
        <div className="coligacao-box">
          {[presEscolha, govEscolha].filter((x): x is Escolha => !!x).map((e) => (
            <div key={e.cand.sq_candidato} className="coligacao-linha">
              <div className="coligacao-nome">
                {nomeExibicao(e.cand)} · {titulo(e.cand.ds_cargo)}
                {e.cand.nm_coligacao ? ` — ${titulo(e.cand.nm_coligacao)}` : ' (partido isolado)'}
                {e.espectro ? <span className="chip chip-espectro">{e.espectro}</span> : null}
              </div>
              <div className="chips">
                {e.siglas.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {resultado && (
        <ResultadoLista candidatos={resultado} agruparPorCargo extraChips={alinhamentosDe} />
      )}
    </section>
  )
}
