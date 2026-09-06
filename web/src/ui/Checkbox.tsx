import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  disabled?: boolean
  name?: string
  value?: string
}

/** Checkbox único — quadrado arredondado roxo com "check" branco. */
export function Checkbox({ checked, onChange, children, disabled, name, value }: CheckboxProps) {
  return (
    <label className={`qtr-check${disabled ? ' qtr-check--disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="qtr-check-box" aria-hidden="true">
        <Icon name="check" size={12} strokeWidth={3} />
      </span>
      <span>{children}</span>
    </label>
  )
}
