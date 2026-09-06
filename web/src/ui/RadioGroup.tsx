import { useId } from 'react'
import type { ReactNode } from 'react'
import { Field } from './Field'
import type { SelectOption } from './SelectField'

interface RadioGroupProps {
  label?: ReactNode
  hint?: ReactNode
  help?: ReactNode
  value: string
  onChange: (value: string) => void
  options: readonly (SelectOption | string)[]
  name?: string
  disabled?: boolean
}

/** Lista de rádios (uma escolha). Ex.: "Você tem um posicionamento político?" */
export function RadioGroup({
  label,
  hint,
  help,
  value,
  onChange,
  options,
  name,
  disabled,
}: RadioGroupProps) {
  const autoName = useId()
  const groupName = name ?? autoName
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <Field as="fieldset" label={label} hint={hint} help={help}>
      <div className="qtr-radio-group">
        {norm.map((o) => (
          <label
            key={o.value}
            className={`qtr-radio${disabled ? ' qtr-radio--disabled' : ''}`}
          >
            <input
              type="radio"
              name={groupName}
              value={o.value}
              checked={value === o.value}
              disabled={disabled}
              onChange={() => onChange(o.value)}
            />
            <span className="qtr-radio-dot" aria-hidden="true" />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </Field>
  )
}
