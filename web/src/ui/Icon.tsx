import type { SVGProps } from 'react'

// Conjunto mínimo de ícones em traço (24×24, currentColor) — mesmo estilo do
// "QTR UI Design System". Uso: <Icon name="chevron-down" size={18} />
export type IconName =
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-right'
  | 'chevron-left'
  | 'check'
  | 'x'
  | 'user'
  | 'users'
  | 'briefcase'
  | 'link'
  | 'arrow-right'
  | 'star'
  | 'info'
  | 'alert-triangle'
  | 'genero-feminino'
  | 'genero-masculino'
  | 'genero-nao-binario'

const PATHS: Record<IconName, React.ReactNode> = {
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  'chevron-up': <path d="M6 15l6-6 6 6" />,
  'chevron-right': <path d="M9 6l6 6-6 6" />,
  'chevron-left': <path d="M15 6l-6 6 6 6" />,
  check: <path d="M5 12l5 5L20 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.5 3-5 6-5s6 1.5 6 5" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.9M17 20c0-3-1.4-4.6-3-5.4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  'arrow-right': <path d="M9 6l6 6-6 6" />,
  star: <path d="M12 2l3 5 5 1-4 4 1 6-5-3-5 3 1-6-4-4 5-1z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5M12 18h.01" />
    </>
  ),
  'genero-feminino': (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M12 13v8M9 18h6" />
    </>
  ),
  'genero-masculino': (
    <>
      <circle cx="10" cy="14" r="5" />
      <path d="M14 10l6-6M15 4h5v5" />
    </>
  ),
  'genero-nao-binario': (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 17v4M12 3v4M5 12H1M23 12h-4" />
    </>
  ),
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
