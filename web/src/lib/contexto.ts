import { useSearchParams } from 'react-router-dom'
import { cargosParaUf } from './constants'

// Contexto global (acima dos caminhos): Estado + Cargo. Vive na URL
// (?uf=SP&cargo=GOVERNADOR%20E%20VICE) para persistir entre os caminhos e no reload.
export function useContexto() {
  const [sp, setSp] = useSearchParams()
  const uf = sp.get('uf') ?? ''
  const cargo = sp.get('cargo') ?? ''

  function setUf(valor: string) {
    const next = new URLSearchParams(sp)
    if (valor) next.set('uf', valor)
    else next.delete('uf')
    // o cargo pode não valer para a nova UF (ex.: BR→SP com "Presidente e vice")
    const c = next.get('cargo')
    if (c && !cargosParaUf(valor).some((o) => o.value === c)) next.delete('cargo')
    setSp(next, { replace: true })
  }

  function setCargo(valor: string) {
    const next = new URLSearchParams(sp)
    if (valor) next.set('cargo', valor)
    else next.delete('cargo')
    setSp(next, { replace: true })
  }

  function limpar() {
    const next = new URLSearchParams(sp)
    next.delete('uf')
    next.delete('cargo')
    setSp(next, { replace: true })
  }

  return { uf, cargo, setUf, setCargo, limpar, query: sp.toString() }
}
