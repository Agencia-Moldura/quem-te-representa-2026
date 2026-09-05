import { Link } from 'react-router-dom'
import { useContexto } from '../lib/contexto'

export function CaminhoHeader({ n, titulo, sub }: { n: string; titulo: string; sub: string }) {
  const { uf, cargo, query } = useContexto()
  return (
    <>
      <Link to={{ pathname: '/match-eleitoral-2026', search: query }} className="voltar">
        ← todos os caminhos
      </Link>
      <h1 className="page-titulo">Caminho {n} · {titulo}</h1>
      <p className="page-lead">{sub}</p>
      <p className="contexto-atual">
        <strong>{cargo || 'todos os cargos'}</strong> · <strong>{uf || 'todo o Brasil'}</strong>
        <span className="contexto-hint"> — ajuste na barra do topo</span>
      </p>
    </>
  )
}
