import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export interface Crumb {
  label: ReactNode
  href?: string
  onClick?: () => void
}

/** Trilha de navegação com ">" entre os itens. O último não é link. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="qtr-breadcrumb" aria-label="trilha de navegação">
      {items.map((c, i) => {
        const ultimo = i === items.length - 1
        return (
          <Fragment key={i}>
            {ultimo || (!c.href && !c.onClick) ? (
              <span className="qtr-breadcrumb-current" aria-current={ultimo ? 'page' : undefined}>
                {c.label}
              </span>
            ) : c.href ? (
              <a href={c.href}>{c.label}</a>
            ) : (
              <button type="button" className="qtr-linklike" style={{ fontSize: 'inherit', textDecoration: 'none', fontWeight: 500 }} onClick={c.onClick}>
                {c.label}
              </button>
            )}
            {!ultimo && (
              <span className="qtr-breadcrumb-sep">
                <Icon name="chevron-right" size={16} />
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
