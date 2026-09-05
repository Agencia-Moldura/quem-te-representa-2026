import { CARGOS, UFS } from '../lib/constants'
import { useContexto } from '../lib/contexto'

export function FiltroGlobal() {
  const { uf, cargo, setUf, setCargo } = useContexto()

  if (!uf) {
    return (
      <div className="filtro-global filtro-global--vazio">
        <span className="fg-titulo">Passo 1</span>
        <span className="fg-em">escolha o seu estado</span>
      </div>
    )
  }

  return (
    <div className="filtro-global">
      <span className="fg-titulo">Estou vendo</span>
      <select value={uf} onChange={(e) => setUf(e.target.value)} aria-label="Estado">
        {UFS.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <span className="fg-em">·</span>
      <select value={cargo} onChange={(e) => setCargo(e.target.value)} aria-label="Cargo">
        <option value="">todos os cargos</option>
        {CARGOS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {cargo && (
        <button type="button" className="fg-limpar" onClick={() => setCargo('')}>
          limpar cargo
        </button>
      )}
    </div>
  )
}
