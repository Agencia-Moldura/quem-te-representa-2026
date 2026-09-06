import { useNavigate } from 'react-router-dom'
import { useContexto } from '../lib/contexto'
import { Breadcrumb, Chip, ChipGroup } from '../ui'

export function CaminhoHeader({ n, titulo, sub }: { n: string; titulo: string; sub: string }) {
  const { uf, cargo, query } = useContexto()
  const navigate = useNavigate()

  return (
    <header className="caminho-header">
      <Breadcrumb
        items={[
          { label: 'Match eleitoral', onClick: () => navigate({ pathname: '/match-eleitoral-2026', search: query }) },
          { label: uf || 'Brasil' },
          { label: `Caminho ${n}` },
        ]}
      />
      <p className="qtr-eyebrow">Caminho {n}</p>
      <h1 className="page-titulo">{titulo}</h1>
      <p className="page-lead">{sub}</p>
      <ChipGroup>
        <Chip variant="outline">{uf || 'todo o Brasil'}</Chip>
        <Chip variant="outline">{cargo || 'todos os cargos'}</Chip>
        <span className="contexto-hint">ajuste na barra do topo</span>
      </ChipGroup>
    </header>
  )
}
