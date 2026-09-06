import type { HTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** sombra suave em vez da sombra média */
  flat?: boolean
  /** padding maior (40×48) para painéis */
  padLg?: boolean
  children: ReactNode
}

/** Superfície branca arredondada. Base para cartões de conteúdo. */
export function Card({ flat, padLg, className = '', children, ...rest }: CardProps) {
  const cls = ['qtr-card', flat && 'qtr-card--flat', padLg && 'qtr-card--pad-lg', className]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}

/** Disco lavanda com ícone — cabeçalho de um "feature card". */
export function CardIcon({ name }: { name: IconName }) {
  return (
    <span className="qtr-card-icon">
      <Icon name={name} size={26} strokeWidth={1.8} />
    </span>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <div className="qtr-card-title">{children}</div>
}

export function CardText({ children }: { children: ReactNode }) {
  return <p className="qtr-card-text">{children}</p>
}
