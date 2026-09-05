import { useState } from 'react'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { Field, NumberInput, Select } from '../components/Campos'
import { ResultadoLista } from '../components/ResultadoLista'
import { buscarPorPerfil } from '../lib/api'
import { CORES_RACA, GENEROS, ORDENACOES } from '../lib/constants'
import type { Ordenacao } from '../lib/constants'
import { useContexto } from '../lib/contexto'
import type { Candidato } from '../types'

export function CaminhoPerfil() {
  const { uf, cargo } = useContexto()

  const [genero, setGenero] = useState('')
  const [corRaca, setCorRaca] = useState('')
  const [idadeMin, setIdadeMin] = useState('')
  const [idadeMax, setIdadeMax] = useState('')
  const [ordenar, setOrdenar] = useState<Ordenacao>('nome')

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Candidato[] | null>(null)

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
          idadeMin: idadeMin ? Number(idadeMin) : undefined,
          idadeMax: idadeMax ? Number(idadeMax) : undefined,
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

      <form className="filtros" onSubmit={buscar}>
        <Field label="Gênero">
          <Select value={genero} onChange={setGenero} options={GENEROS} placeholder="todos" />
        </Field>
        <Field label="Cor/raça">
          <Select value={corRaca} onChange={setCorRaca} options={CORES_RACA} placeholder="todas" />
        </Field>
        <Field label="Idade mín.">
          <NumberInput value={idadeMin} onChange={setIdadeMin} placeholder="18" min={18} max={120} />
        </Field>
        <Field label="Idade máx.">
          <NumberInput value={idadeMax} onChange={setIdadeMax} placeholder="99" min={18} max={120} />
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
      </form>

      {erro && <p className="erro">{erro}</p>}
      {resultado && <ResultadoLista candidatos={resultado} truncadoEm={300} />}
    </section>
  )
}
