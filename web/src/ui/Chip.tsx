import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface ChipProps {
  children: ReactNode
  /** mostra o "x" e chama onRemove ao clicar */
  onRemove?: () => void
  variant?: 'solid' | 'media' | 'outline'
}

/** Etiqueta. Com onRemove vira chip removível (lavanda + "x"). */
export function Chip({ children, onRemove, variant = 'solid' }: ChipProps) {
  const cls = [
    'qtr-chip',
    variant === 'media' && 'qtr-chip--media',
    variant === 'outline' && 'qtr-chip--outline',
    onRemove && 'qtr-chip--removable',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={cls}>
      {children}
      {onRemove && (
        <button type="button" className="qtr-chip-x" aria-label="remover" onClick={onRemove}>
          <Icon name="x" size={12} strokeWidth={2.4} />
        </button>
      )}
    </span>
  )
}

export function ChipGroup({ children }: { children: ReactNode }) {
  return <div className="qtr-chips">{children}</div>
}
