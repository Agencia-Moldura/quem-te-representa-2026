import type { ReactNode } from 'react'
import { Field } from './Field'
import type { SelectOption } from './SelectField'

interface TagToggleGroupProps {
  label?: ReactNode
  hint?: ReactNode
  help?: ReactNode
  /** valores marcados (seleção múltipla, união) */
  value: string[]
  onChange: (next: string[]) => void
  options: readonly (SelectOption | string)[]
  disabled?: boolean
}

/**
 * Grupo de tags-pílula com seleção múltipla por união (marque quantas quiser).
 * Usado em pautas prioritárias, profissão, escolaridade, faixa de idade…
 */
export function TagToggleGroup({
  label,
  hint,
  help,
  value,
  onChange,
  options,
  disabled,
}: TagToggleGroupProps) {
  const set = new Set(value)
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))

  function toggle(v: string) {
    const n = new Set(set)
    if (n.has(v)) n.delete(v)
    else n.add(v)
    onChange([...n])
  }

  const legenda = (
    <>
      {label}
      {value.length > 0 && (
        <button
          type="button"
          className="qtr-linklike"
          onClick={() => onChange([])}
          style={{ marginLeft: 8 }}
        >
          limpar ({value.length})
        </button>
      )}
    </>
  )

  return (
    <Field as="fieldset" label={label ? legenda : undefined} hint={hint} help={help}>
      <div className="qtr-tags">
        {norm.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`qtr-tag${set.has(o.value) ? ' is-on' : ''}`}
            aria-pressed={set.has(o.value)}
            disabled={disabled}
            onClick={() => toggle(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  )
}
