import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Field } from './Field'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: ReactNode
  hint?: ReactNode
  help?: ReactNode
  error?: ReactNode
  onChange?: (value: string) => void
}

/** Input de texto/e-mail/número com rótulo. Visual "Formulários" do guia. */
export function TextField({
  label,
  hint,
  help,
  error,
  id,
  className = '',
  onChange,
  ...rest
}: TextFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <Field label={label} hint={hint} help={help} error={error} htmlFor={fieldId}>
      <input
        id={fieldId}
        className={`qtr-input ${className}`.trim()}
        aria-invalid={error != null || undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        {...rest}
      />
    </Field>
  )
}
