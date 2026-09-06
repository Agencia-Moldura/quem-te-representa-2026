import { useId } from 'react'
import type { ReactNode } from 'react'
import { Field } from './Field'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label?: ReactNode
  hint?: ReactNode
  help?: ReactNode
  error?: ReactNode
  value: string
  onChange: (value: string) => void
  /** primeira opção neutra (value ""). Omita para não ter placeholder. */
  placeholder?: string
  options: readonly (SelectOption | string)[]
  id?: string
  disabled?: boolean
  name?: string
}

/** Select nativo estilizado: borda tinta quando vazio, roxa quando preenchido. */
export function SelectField({
  label,
  hint,
  help,
  error,
  value,
  onChange,
  placeholder,
  options,
  id,
  disabled,
  name,
}: SelectFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <Field label={label} hint={hint} help={help} error={error} htmlFor={fieldId}>
      <select
        id={fieldId}
        name={name}
        className={`qtr-select${value ? ' is-filled' : ''}`}
        value={value}
        disabled={disabled}
        aria-invalid={error != null || undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder != null && <option value="">{placeholder}</option>}
        {norm.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
