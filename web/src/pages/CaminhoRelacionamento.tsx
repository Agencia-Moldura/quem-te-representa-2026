import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { MaisFiltros } from '../components/MaisFiltros'
import { ResultadoLista } from '../components/ResultadoLista'
import { candidatosAlinhados, governadoresDaUf, presidentes, siglasDaCandidatura } from '../lib/api'
import { ehChapa } from '../lib/constants'
import { useContexto } from '../lib/contexto'
import { nomeExibicao, rotuloOpcao, titulo } from '../lib/format'
import { OP_COR_RACA, OP_GENERO_CARDS, OP_GRAU, OP_IDADE } from '../lib/opcoes'
import type { Candidato } from '../types'
import {
  Alert,
  Button,
  Chip,
  ChipGroup,
  OptionCardGroup,
  SelectField,
  StatusBadge,
  SwatchSelectGroup,
  TagToggleGroup,
} from '../ui'

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

      <div className="qtr-card filtro-form">
        <div className="filtro-form-linha">
          <SelectField
            label="Presidência"
            hint="(opcional)"
            placeholder="— nenhuma —"
            value={presSq}
            onChange={setPresSq}
            options={presis.map((p) => ({ value: p.sq_candidato, label: rotuloOpcao(p) }))}
          />
          <SelectField
            label={`Governo de ${uf}`}
            hint="(opcional)"
            placeholder="— nenhuma —"
            value={govSq}
            onChange={setGovSq}
            options={govs.map((g) => ({
              value: g.sq_candidato,
              label: g.nm_coligacao ? `${rotuloOpcao(g)} — ${g.nm_coligacao}` : rotuloOpcao(g),
            }))}
          />
        </div>

        <div className="filtro-form-acoes">
          <Button type="button" onClick={buscar} disabled={carregando}>
            {carregando ? 'Buscando…' : 'Ver candidatos alinhados'}
          </Button>
        </div>

        <MaisFiltros caminho="Relacionamento">
          <TagToggleGroup
            label="Faixa de idade"
            hint="qualquer uma"
            value={faixasIdade}
            onChange={setFaixasIdade}
            options={OP_IDADE}
          />
          <TagToggleGroup
            label="Escolaridade"
            hint="qualquer uma"
            value={escolaridades}
            onChange={setEscolaridades}
            options={OP_GRAU}
          />
          <OptionCardGroup
            label="Gênero"
            value={genero}
            onChange={(v) => setGenero(v === genero ? '' : v)}
            options={OP_GENERO_CARDS}
          />
          <SwatchSelectGroup
            label="Cor/raça"
            multiple={false}
            value={corRaca ? [corRaca] : []}
            onChange={(a) => setCorRaca(a[0] ?? '')}
            options={OP_COR_RACA}
          />
        </MaisFiltros>
      </div>

      {erro && <Alert tone="warn">{erro}</Alert>}

      {(presEscolha || govEscolha) && (
        <div className="qtr-card coligacao-box">
          {[presEscolha, govEscolha].filter((x): x is Escolha => !!x).map((e) => (
            <div key={e.cand.sq_candidato} className="coligacao-linha">
              <div className="coligacao-nome">
                {nomeExibicao(e.cand)} · {titulo(e.cand.ds_cargo)}
                {e.cand.nm_coligacao ? ` — ${titulo(e.cand.nm_coligacao)}` : ' (partido isolado)'}
                {e.espectro ? <StatusBadge tone="solid">{e.espectro}</StatusBadge> : null}
              </div>
              <ChipGroup>
                {e.siglas.map((s) => (
                  <Chip key={s} variant="outline">{s}</Chip>
                ))}
              </ChipGroup>
            </div>
          ))}
        </div>
      )}

      {resultado && (
        <ResultadoLista
          candidatos={resultado}
          agruparPorCargo
          chapa={ehChapa(cargo)}
          extraChips={alinhamentosDe}
        />
      )}
    </section>
  )
}
