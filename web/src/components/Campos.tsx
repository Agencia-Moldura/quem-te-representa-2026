import type { ReactNode } from 'react'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint ? <span className="field-hint"> {hint}</span> : null}
      </span>
      {children}
    </label>
  )
}

interface SelectProps {
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder?: string
}

export function Select({ value, onChange, options, placeholder = 'todos' }: SelectProps) {
  return (
    <select className="field-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

interface NumProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  min?: number
  max?: number
}

export function NumberInput({ value, onChange, placeholder, min, max }: NumProps) {
  return (
    <input
      className="field-input"
      type="number"
      inputMode="numeric"
      value={value}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

interface CheckGroupProps {
  label: string
  hint?: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
}

export function CheckGroup({ label, hint, options, selected, onChange }: CheckGroupProps) {
  const set = new Set(selected)
  function toggle(v: string) {
    const n = new Set(set)
    if (n.has(v)) n.delete(v)
    else n.add(v)
    onChange([...n])
  }
  return (
    <fieldset className="check-grupo">
      <legend className="field-label">
        {label}
        {hint ? <span className="field-hint"> {hint}</span> : null}
        {selected.length > 0 && (
          <button type="button" className="check-limpar" onClick={() => onChange([])}>
            limpar ({selected.length})
          </button>
        )}
      </legend>
      <div className="check-opcoes">
        {options.map((o) => (
          <label key={o.value} className={`check-item ${set.has(o.value) ? 'is-on' : ''}`}>
            <input type="checkbox" checked={set.has(o.value)} onChange={() => toggle(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
