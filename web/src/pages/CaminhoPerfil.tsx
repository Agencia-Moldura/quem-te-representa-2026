import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { CheckGroup, Field, Select } from '../components/Campos'
import { ResultadoLista } from '../components/ResultadoLista'
import { buscarPorPerfil } from '../lib/api'
import type { ResultadoBusca } from '../lib/api'
import { CORES_RACA, FAIXAS_IDADE, GENEROS, ORDENACOES } from '../lib/constants'
import type { Ordenacao } from '../lib/constants'
import { useContexto } from '../lib/contexto'

const OPCOES_IDADE = FAIXAS_IDADE.map((f) => ({ value: f.id, label: f.label }))

export function CaminhoPerfil() {
  const { uf, cargo } = useContexto()

  const [genero, setGenero] = useState('')
  const [corRaca, setCorRaca] = useState('')
  const [faixasIdade, setFaixasIdade] = useState<string[]>([])
  const [ordenar, setOrdenar] = useState<Ordenacao>('nome')

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
        await buscarPorPerfil({
          uf: uf || undefined,
          cargo: cargo || undefined,
          genero: genero || undefined,
          corRaca: corRaca || undefined,
          faixasIdade,
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
          options={OPCOES_IDADE}
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
      </form>

      {erro && <p className="erro">{erro}</p>}
      {resultado && (
        <ResultadoLista candidatos={resultado.lista} totalFiltrado={resultado.totalFiltrado} total={resultado.total} />
      )}
    </section>
  )
}
