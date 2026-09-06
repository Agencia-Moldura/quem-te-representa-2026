import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { MaisFiltros } from '../components/MaisFiltros'
import { ResultadoLista } from '../components/ResultadoLista'
import { buscarCandidatos } from '../lib/api'
import type { FiltroCandidatos, ResultadoBusca } from '../lib/api'
import { ehChapa } from '../lib/constants'
import type { Ordenacao } from '../lib/constants'
import { useContexto } from '../lib/contexto'
import {
  OP_CIVIL,
  OP_COR_RACA,
  OP_GENERO_CARDS,
  OP_GRAU,
  OP_IDADE,
  OP_ORDENACAO,
  OP_SITUACAO,
} from '../lib/opcoes'
import {
  Alert,
  Button,
  OptionCardGroup,
  SelectField,
  SwatchSelectGroup,
  TagToggleGroup,
} from '../ui'

export function CaminhoPerfil() {
  const { uf, cargo } = useContexto()

  const [genero, setGenero] = useState('')
  const [corRaca, setCorRaca] = useState('')
  const [faixasIdade, setFaixasIdade] = useState<string[]>([])
  const [ordenar, setOrdenar] = useState<Ordenacao>('nome')

  // mais filtros
  const [escolaridades, setEscolaridades] = useState<string[]>([])
  const [estadosCivis, setEstadosCivis] = useState<string[]>([])
  const [situacao, setSituacao] = useState<FiltroCandidatos['situacao']>('')

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoBusca | null>(null)

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
          genero: genero || undefined,
          corRaca: corRaca || undefined,
          faixasIdade,
          escolaridades,
          estadosCivis,
          situacao,
          ordenar,
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
        n="1"
        titulo="Perfil"
        sub="Idade, gênero e cor/raça autodeclarados no registro de candidatura."
      />

      <form className="qtr-card filtro-form" onSubmit={buscar}>
        <TagToggleGroup
          label="Faixa de idade"
          hint="marque quantas quiser"
          value={faixasIdade}
          onChange={setFaixasIdade}
          options={OP_IDADE}
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

        <div className="filtro-form-acoes">
          <SelectField
            label="Ordenar por"
            value={ordenar}
            onChange={(v) => setOrdenar(v as Ordenacao)}
            options={OP_ORDENACAO}
          />
          <Button type="submit" disabled={carregando}>
            {carregando ? 'Buscando…' : 'Buscar'}
          </Button>
        </div>

        <MaisFiltros caminho="Perfil">
          <TagToggleGroup
            label="Escolaridade"
            hint="qualquer uma"
            value={escolaridades}
            onChange={setEscolaridades}
            options={OP_GRAU}
          />
          <TagToggleGroup
            label="Estado civil"
            hint="qualquer um"
            value={estadosCivis}
            onChange={setEstadosCivis}
            options={OP_CIVIL}
          />
          <SelectField
            label="Situação da candidatura"
            value={situacao}
            onChange={(v) => setSituacao(v as FiltroCandidatos['situacao'])}
            options={OP_SITUACAO}
          />
        </MaisFiltros>
      </form>

      {erro && <Alert tone="warn">{erro}</Alert>}
      {resultado && (
        <ResultadoLista
          candidatos={resultado.lista}
          totalFiltrado={resultado.totalFiltrado}
          total={resultado.total}
          chapa={ehChapa(cargo)}
        />
      )}
    </section>
  )
}
