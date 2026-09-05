import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { CheckGroup, Field, Select } from '../components/Campos'
import { MaisFiltros } from '../components/MaisFiltros'
import { ResultadoLista } from '../components/ResultadoLista'
import { buscarCandidatos } from '../lib/api'
import type { FiltroCandidatos, ResultadoBusca } from '../lib/api'
import {
  CORES_RACA,
  ESTADOS_CIVIS,
  FAIXAS_IDADE,
  GENEROS,
  GRAUS_INSTRUCAO,
  ORDENACOES,
  SITUACOES,
} from '../lib/constants'
import type { Ordenacao } from '../lib/constants'
import { useContexto } from '../lib/contexto'

const OP_IDADE = FAIXAS_IDADE.map((f) => ({ value: f.id, label: f.label }))
const OP_GRAU = GRAUS_INSTRUCAO.map(([v, l]) => ({ value: v, label: l }))
const OP_CIVIL = ESTADOS_CIVIS.map(([v, l]) => ({ value: v, label: l }))

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

      <form className="filtros filtros-checks" onSubmit={buscar}>
        <CheckGroup
          label="Faixa de idade"
          hint="(qualquer uma das marcadas)"
          options={OP_IDADE}
          selected={faixasIdade}
          onChange={setFaixasIdade}
        />

        <div className="filtros-rodape">
          <Field label="Gênero">
            <Select value={genero} onChange={setGenero} options={GENEROS} placeholder="todos" />
          </Field>
          <Field label="Cor/raça">
            <Select value={corRaca} onChange={setCorRaca} options={CORES_RACA} placeholder="todas" />
          </Field>
          <Field label="Ordenar por">
            <select
              className="field-select"
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value as Ordenacao)}
            >
              {ORDENACOES.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </Field>
          <button className="btn-buscar" type="submit" disabled={carregando}>
            {carregando ? 'Buscando…' : 'Buscar'}
          </button>
        </div>

        <MaisFiltros caminho="Perfil">
          <CheckGroup
            label="Escolaridade"
            hint="(qualquer uma)"
            options={OP_GRAU}
            selected={escolaridades}
            onChange={setEscolaridades}
          />
          <CheckGroup
            label="Estado civil"
            hint="(qualquer um)"
            options={OP_CIVIL}
            selected={estadosCivis}
            onChange={setEstadosCivis}
          />
          <Field label="Situação da candidatura">
            <select
              className="field-select"
              value={situacao}
              onChange={(e) => setSituacao(e.target.value as FiltroCandidatos['situacao'])}
            >
              {SITUACOES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Field>
        </MaisFiltros>
      </form>

      {erro && <p className="erro">{erro}</p>}
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
