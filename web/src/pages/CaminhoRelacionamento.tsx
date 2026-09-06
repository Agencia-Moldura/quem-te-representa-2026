import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { FiltroProfissao } from '../components/FiltroProfissao'
import { MaisFiltros } from '../components/MaisFiltros'
import { RelacionamentoFields } from '../components/RelacionamentoFields'
import { ResultadoLista } from '../components/ResultadoLista'
import { candidatosAlinhados } from '../lib/api'
import { ehChapa } from '../lib/constants'
import { useContexto } from '../lib/contexto'
import { nomeExibicao, titulo } from '../lib/format'
import { useRelacionamento } from '../lib/relacionamento'
import type { EscolhaExec } from '../lib/relacionamento'
import { OP_COR_RACA, OP_GENERO_CARDS, OP_GRAU, OP_IDADE, OP_PATRIMONIO } from '../lib/opcoes'
import type { Candidato } from '../types'
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  ChipGroup,
  OptionCardGroup,
  StatusBadge,
  SwatchSelectGroup,
  TagToggleGroup,
} from '../ui'

export function CaminhoRelacionamento() {
  const { uf, cargo } = useContexto()
  const rel = useRelacionamento(uf)

  // mais filtros — perfil + currículo
  const [faixasIdade, setFaixasIdade] = useState<string[]>([])
  const [genero, setGenero] = useState('')
  const [corRaca, setCorRaca] = useState('')
  const [escolaridades, setEscolaridades] = useState<string[]>([])
  const [ocupacoes, setOcupacoes] = useState<string[]>([])
  const [faixasPatrimonio, setFaixasPatrimonio] = useState<string[]>([])
  const [reeleicao, setReeleicao] = useState(false)

  const [escolhas, setEscolhas] = useState<EscolhaExec[]>([])
  const [resultado, setResultado] = useState<Candidato[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  if (!uf) return <Navigate to="/match-eleitoral-2026" replace />

  async function buscar() {
    setErro(null)
    setResultado(null)
    const { partidos, escolhas: esc } = await rel.resolver()
    if (!esc.length) {
      setErro('Escolha ao menos uma candidatura (presidência e/ou governo).')
      return
    }
    setCarregando(true)
    try {
      setEscolhas(esc)
      setResultado(
        await candidatosAlinhados({
          uf,
          cargo: cargo || undefined,
          partidos,
          faixasIdade,
          genero: genero || undefined,
          corRaca: corRaca || undefined,
          escolaridades,
          ocupacoes,
          faixasPatrimonio,
          reeleicao,
        }),
      )
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro')
    } finally {
      setCarregando(false)
    }
  }

  const chips = escolhas.length ? rel.chipsAlinhamento(escolhas) : undefined

  return (
    <section>
      <CaminhoHeader
        n="3"
        titulo="Relacionamento político"
        sub="Diga em quem você pensa em votar para presidência e para o governo do seu estado. Listamos os candidatos cujo partido integra a coligação de uma dessas candidaturas (ou das duas)."
      />

      <div className="qtr-card filtro-form">
        <RelacionamentoFields
          uf={uf}
          presis={rel.presis}
          govs={rel.govs}
          presSq={rel.presSq}
          setPresSq={rel.setPresSq}
          govSq={rel.govSq}
          setGovSq={rel.setGovSq}
        />

        <div className="filtro-form-acoes">
          <Button type="button" onClick={buscar} disabled={carregando}>
            {carregando ? 'Buscando…' : 'Ver candidatos alinhados'}
          </Button>
        </div>

        <MaisFiltros caminho="Relacionamento">
          <FiltroProfissao uf={uf} cargo={cargo} value={ocupacoes} onChange={setOcupacoes} />
          <TagToggleGroup
            label="Faixa de patrimônio"
            hint="qualquer uma"
            value={faixasPatrimonio}
            onChange={setFaixasPatrimonio}
            options={OP_PATRIMONIO}
          />
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
          <div className="filtro-form-linha">
            <OptionCardGroup
              label="Gênero"
              value={genero}
              onChange={(v) => setGenero(v === genero ? '' : v)}
              options={OP_GENERO_CARDS}
            />
          </div>
          <SwatchSelectGroup
            label="Cor/raça"
            multiple={false}
            value={corRaca ? [corRaca] : []}
            onChange={(a) => setCorRaca(a[0] ?? '')}
            options={OP_COR_RACA}
          />
          <Checkbox checked={reeleicao} onChange={setReeleicao}>
            Concorrendo à reeleição
          </Checkbox>
        </MaisFiltros>
      </div>

      {erro && <Alert tone="warn">{erro}</Alert>}

      {escolhas.length > 0 && (
        <div className="qtr-card coligacao-box">
          {escolhas.map((e) => (
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
          extraChips={chips}
        />
      )}
    </section>
  )
}
