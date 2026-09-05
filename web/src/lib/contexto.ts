import { useSearchParams } from 'react-router-dom'

// Contexto global (acima dos caminhos): Estado + Cargo. Vive na URL
// (?uf=SP&cargo=GOVERNADOR) para persistir entre os caminhos e no reload.
export function useContexto() {
  const [sp, setSp] = useSearchParams()
  const uf = sp.get('uf') ?? ''
  const cargo = sp.get('cargo') ?? ''

  function definir(chave: 'uf' | 'cargo', valor: string) {
    const next = new URLSearchParams(sp)
    if (valor) next.set(chave, valor)
    else next.delete(chave)
    setSp(next, { replace: true })
  }

  function limpar() {
    const next = new URLSearchParams(sp)
    next.delete('uf')
    next.delete('cargo')
    setSp(next, { replace: true })
  }

  return {
    uf,
    cargo,
    setUf: (v: string) => definir('uf', v),
    setCargo: (v: string) => definir('cargo', v),
    limpar,
    query: sp.toString(),
  }
}
