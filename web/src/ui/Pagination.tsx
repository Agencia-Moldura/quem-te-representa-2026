import { Icon } from './Icon'

interface PaginationProps {
  /** total de páginas */
  total: number
  /** página atual (base 1) */
  atual: number
  onChange: (pagina: number) => void
  /** quantos números mostrar antes de reticências (default: todos) */
  maxVisivel?: number
}

/** Paginação numérica. Página atual = disco tinta. */
export function Pagination({ total, atual, onChange, maxVisivel }: PaginationProps) {
  if (total <= 1) return null
  let paginas = Array.from({ length: total }, (_, i) => i + 1)
  if (maxVisivel && total > maxVisivel) {
    const meio = Math.floor(maxVisivel / 2)
    let ini = Math.max(1, atual - meio)
    const fim = Math.min(total, ini + maxVisivel - 1)
    ini = Math.max(1, fim - maxVisivel + 1)
    paginas = Array.from({ length: fim - ini + 1 }, (_, i) => ini + i)
  }

  return (
    <nav className="qtr-pagination" aria-label="paginação">
      {paginas[0] > 1 && (
        <button
          type="button"
          className="qtr-page qtr-page--arrow"
          aria-label="página anterior"
          onClick={() => onChange(atual - 1)}
          disabled={atual === 1}
        >
          <Icon name="chevron-left" size={18} />
        </button>
      )}
      {paginas.map((p) => (
        <button
          key={p}
          type="button"
          className={`qtr-page${p === atual ? ' is-current' : ''}`}
          aria-current={p === atual ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      {paginas[paginas.length - 1] < total && (
        <button
          type="button"
          className="qtr-page qtr-page--arrow"
          aria-label="próxima página"
          onClick={() => onChange(atual + 1)}
          disabled={atual === total}
        >
          <Icon name="chevron-right" size={18} />
        </button>
      )}
    </nav>
  )
}
