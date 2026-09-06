import type { ReactNode } from 'react'
import { Field } from './Field'

export interface SwatchItem {
  value: string
  label: string
  /** cor do disco à esquerda do rótulo */
  cor: string
}

interface SwatchSelectGroupProps {
  label?: ReactNode
  hint?: ReactNode
  help?: ReactNode
  value: string[]
  onChange: (next: string[]) => void
  options: SwatchItem[]
  /** false → escolha única (clicar de novo desmarca). default: múltipla (união) */
  multiple?: boolean
}

/** Seleção de cor/raça com disco de cor. Chip lavanda quando marcado. */
export function SwatchSelectGroup({
  label,
  hint,
  help,
  value,
  onChange,
  options,
  multiple = true,
}: SwatchSelectGroupProps) {
  const set = new Set(value)

  function toggle(v: string) {
    if (!multiple) {
      onChange(set.has(v) ? [] : [v])
      return
    }
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
      <div className="qtr-swatches">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`qtr-swatch${set.has(o.value) ? ' is-on' : ''}`}
            aria-pressed={set.has(o.value)}
            onClick={() => toggle(o.value)}
          >
            <span className="qtr-swatch-dot" style={{ background: o.cor }} />
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  )
}
