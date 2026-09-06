import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { MaisFiltros } from '../components/MaisFiltros'
import { ResultadoLista } from '../components/ResultadoLista'
import { buscarCandidatos, ocupacoesDisponiveis } from '../lib/api'
import type { FiltroCandidatos, ResultadoBusca } from '../lib/api'
import { OCUPACOES_COMUNS } from '../lib/constants'
import type { OpcaoOcupacao, Ordenacao } from '../lib/constants'
import { useContexto } from '../lib/contexto'
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

// grupo de profissão tem candidato no recorte atual?
function grupoExiste(op: OpcaoOcupacao, valores: string[]): boolean {
  if ((op.exatos ?? []).some((v) => valores.includes(v))) return true
  return (op.prefixos ?? []).some((p) => valores.some((v) => v.startsWith(p)))
}

export function CaminhoCurriculo() {
  const { uf, cargo } = useContexto()

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

  const [dispOcup, setDispOcup] = useState<string[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoBusca | null>(null)

  useEffect(() => {
    setDispOcup(null)
    if (!uf) return
    ocupacoesDisponiveis({ uf, cargo: cargo || undefined })
      .then(setDispOcup)
      .catch(() => setDispOcup([]))
  }, [uf, cargo])

  // só mostra grupos de profissão que têm candidato no recorte
  const gruposVisiveis = useMemo(() => {
    if (!dispOcup) return OCUPACOES_COMUNS
    return OCUPACOES_COMUNS.filter((op) => grupoExiste(op, dispOcup))
  }, [dispOcup])

  useEffect(() => {
    const ids = new Set(gruposVisiveis.map((g) => g.id))
    setOcupacoes((sel) => sel.filter((id) => ids.has(id)))
  }, [gruposVisiveis])

  if (!uf) return <Navigate to="/match-eleitoral-2026" replace />

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)
    try {
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
        }),
      )
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro na busca')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section>
      <CaminhoHeader
        n="2"
        titulo="Currículo"
        sub="Profissão declarada e patrimônio (soma dos bens no registro). Marque quantas opções quiser — o filtro é por união."
      />

      <form className="qtr-card filtro-form" onSubmit={buscar}>
        <TagToggleGroup
          label="Profissão"
          hint={dispOcup ? 'só as que existem para este cargo/estado' : 'carregando…'}
          value={ocupacoes}
          onChange={setOcupacoes}
          options={gruposVisiveis.map((o) => ({ value: o.id, label: o.label }))}
        />
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
        />
      )}
    </section>
  )
}
