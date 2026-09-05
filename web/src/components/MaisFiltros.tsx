import type { ReactNode } from 'react'

export function MaisFiltros({ caminho, children }: { caminho: string; children: ReactNode }) {
  return (
    <details className="mais-filtros">
      <summary className="mais-filtros-toggle">
        Ver mais filtros de {caminho}
      </summary>
      <div className="mais-filtros-corpo">{children}</div>
    </details>
  )
}
