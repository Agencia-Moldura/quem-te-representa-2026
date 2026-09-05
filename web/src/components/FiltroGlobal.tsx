import { CARGOS, UFS } from '../lib/constants'
import { useContexto } from '../lib/contexto'

export function FiltroGlobal() {
  const { uf, cargo, setUf, setCargo, limpar } = useContexto()

  return (
    <div className="filtro-global">
      <span className="fg-titulo">Estou olhando</span>
      <select value={cargo} onChange={(e) => setCargo(e.target.value)} aria-label="Cargo">
        <option value="">todos os cargos</option>
        {CARGOS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <span className="fg-em">em</span>
      <select value={uf} onChange={(e) => setUf(e.target.value)} aria-label="Estado">
        <option value="">todo o Brasil</option>
        {UFS.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      {(uf || cargo) && (
        <button type="button" className="fg-limpar" onClick={limpar}>
          limpar
        </button>
      )}
    </div>
  )
}
