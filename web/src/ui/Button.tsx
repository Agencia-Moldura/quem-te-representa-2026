import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

export type ButtonVariant =
  | 'primary'
  | 'primary-dark'
  | 'outline'
  | 'outline-ink'
  | 'accent'
  | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  block?: boolean
  /** ícone à esquerda do rótulo */
  icon?: IconName
  /** ícone à direita do rótulo (ex.: seta em "Acessar ›") */
  iconRight?: IconName
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  iconRight,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = [
    'qtr-btn',
    `qtr-btn--${variant}`,
    size === 'sm' && 'qtr-btn--sm',
    block && 'qtr-btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 20} className="qtr-btn-icon" />}
      {children}
      {iconRight && (
        <Icon name={iconRight} size={size === 'sm' ? 16 : 18} className="qtr-btn-icon" />
      )}
    </button>
  )
}
