import type { ReactNode } from 'react'

type StatusTone = 'accent' | 'solid' | 'warn' | 'info' | 'success' | 'neutral'

interface StatusBadgeProps {
  children: ReactNode
  tone?: StatusTone
  /** ponto à esquerda (padrão nos selos "accent") */
  dot?: boolean
}

/** Selo de status pequeno. Ex.: "QTR Cast" (accent + ponto), "Novo" (solid). */
export function StatusBadge({ children, tone = 'neutral', dot = tone === 'accent' }: StatusBadgeProps) {
  return (
    <span className={`qtr-status qtr-status--${tone}`}>
      {dot && <span className="qtr-status-dot" />}
      {children}
    </span>
  )
}
