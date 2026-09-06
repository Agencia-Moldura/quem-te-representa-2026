import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { FiltroProfissao } from '../components/FiltroProfissao'
import { MaisFiltros } from '../components/MaisFiltros'
import { RelacionamentoFields } from '../components/RelacionamentoFields'
import { ResultadoLista } from '../components/ResultadoLista'
import { buscarCandidatos } from '../lib/api'
import type { FiltroCandidatos, ResultadoBusca } from '../lib/api'
import { ehChapa } from '../lib/constants'
import type { Ordenacao } from '../lib/constants'
import { useContexto } from '../lib/contexto'
import { useRelacionamento } from '../lib/relacionamento'
import type { EscolhaExec } from '../lib/relacionamento'
import {
  OP_COR_RACA,
  OP_GENERO_CARDS,
  OP_GRAU,
  OP_IDADE,
  OP_ORDENACAO,
  OP_PATRIMONIO,
  OP_SITUACAO,
} from '../lib/opcoes'
import {
  Alert,
  Button,
  Checkbox,
  OptionCardGroup,
  SelectField,
  SwatchSelectGroup,
  TagToggleGroup,
} from '../ui'

export function CaminhoCurriculo() {
  const { uf, cargo } = useContexto()
  const rel = useRelacionamento(uf)

  const [ocupacoes, setOcupacoes] = useState<string[]>([])
  const [faixas, setFaixas] = useState<string[]>([])
  const [reeleicao, setReeleicao] = useState(false)
  const [ordenar, setOrdenar] = useState<Ordenacao>('patrimonio')

  // mais filtros
  const [faixasIdade, setFaixasIdade] = useState<string[]>([])
  const [genero, setGenero] = useState('')
  const [corRaca, setCorRaca] = useState('')
  const [escolaridades, setEscolaridades] = useState<string[]>([])
  const [situacao, setSituacao] = useState<FiltroCandidatos['situacao']>('')

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoBusca | null>(null)
  const [escolhas, setEscolhas] = useState<EscolhaExec[]>([])

  if (!uf) return <Navigate to="/match-eleitoral-2026" replace />

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)
    try {
      const { partidos, escolhas: esc } = await rel.resolver()
      setEscolhas(esc)
      setResultado(
        await buscarCandidatos({
          uf: uf || undefined,
          cargo: cargo || undefined,
          ocupacoes,
          faixasPatrimonio: faixas,
          reeleicao,
          ordenar,
          faixasIdade,
          genero: genero || undefined,
          corRaca: corRaca || undefined,
          escolaridades,
          situacao,
          partidos: partidos.length ? partidos : undefined,
        }),
      )
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro na busca')
    } finally {
      setCarregando(false)
    }
  }

  const chips = escolhas.length ? rel.chipsAlinhamento(escolhas) : undefined

  return (
    <section>
      <CaminhoHeader
        n="2"
        titulo="Currículo"
        sub="Profissão declarada e patrimônio (soma dos bens no registro). Marque quantas opções quiser — o filtro é por união."
      />

      <form className="qtr-card filtro-form" onSubmit={buscar}>
        <FiltroProfissao uf={uf} cargo={cargo} value={ocupacoes} onChange={setOcupacoes} />
        <TagToggleGroup
          label="Faixa de patrimônio"
          hint="qualquer uma das marcadas"
          value={faixas}
          onChange={setFaixas}
          options={OP_PATRIMONIO}
        />

        <div className="filtro-form-acoes">
          <SelectField
            label="Ordenar por"
            value={ordenar}
            onChange={(v) => setOrdenar(v as Ordenacao)}
            options={OP_ORDENACAO}
          />
          <Checkbox checked={reeleicao} onChange={setReeleicao}>
            Concorrendo à reeleição
          </Checkbox>
          <Button type="submit" disabled={carregando}>
            {carregando ? 'Buscando…' : 'Buscar'}
          </Button>
        </div>

        <MaisFiltros caminho="Currículo">
          <RelacionamentoFields
            uf={uf}
            presis={rel.presis}
            govs={rel.govs}
            presSq={rel.presSq}
            setPresSq={rel.setPresSq}
            govSq={rel.govSq}
            setGovSq={rel.setGovSq}
          />
          <p className="filtro-form-nota">
            Escolha uma candidatura à presidência e/ou ao governo para ver só quem está na mesma
            coligação.
          </p>
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
          <SelectField
            label="Situação da candidatura"
            value={situacao}
            onChange={(v) => setSituacao(v as FiltroCandidatos['situacao'])}
            options={OP_SITUACAO}
          />
        </MaisFiltros>
      </form>

      <Alert tone="info">
        <strong>Eleições anteriores / cargos já exercidos</strong> ainda não entraram — é a Fase 2
        (cruzamento de candidaturas de 2018–2024). O campo <code>st_reeleicao</code> do TSE também
        só deve ser preenchido mais perto do pleito.
      </Alert>

      {erro && <Alert tone="warn">{erro}</Alert>}
      {resultado && (
        <ResultadoLista
          candidatos={resultado.lista}
          totalFiltrado={resultado.totalFiltrado}
          total={resultado.total}
          chapa={ehChapa(cargo)}
          extraChips={chips}
        />
      )}
    </section>
  )
}
