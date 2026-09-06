import type { ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

type AlertTone = 'neutral' | 'info' | 'success' | 'warn'

const ICONE: Record<AlertTone, IconName> = {
  neutral: 'alert-triangle',
  info: 'info',
  success: 'check',
  warn: 'alert-triangle',
}

interface AlertProps {
  tone?: AlertTone
  children: ReactNode
  /** troca o ícone padrão do tom */
  icon?: IconName
}

/** Caixa de aviso com ícone. Tons: neutral, info (lavanda), success (lima), warn. */
export function Alert({ tone = 'info', children, icon }: AlertProps) {
  return (
    <div className={`qtr-alert qtr-alert--${tone}`} role="status">
      <span className="qtr-alert-icon">
        <Icon name={icon ?? ICONE[tone]} size={22} />
      </span>
      <div>{children}</div>
    </div>
  )
}
