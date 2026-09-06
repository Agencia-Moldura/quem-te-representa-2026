import type { ReactNode } from 'react'
import { Field } from './Field'
import { Icon } from './Icon'
import type { IconName } from './Icon'

export interface OptionCardItem {
  value: string
  label: string
  /** legenda pequena embaixo (ex.: "ela/dela", "anos") */
  sub?: string
  /** ícone no topo (variante com ícone) */
  icon?: IconName
}

interface OptionCardGroupProps {
  label?: ReactNode
  hint?: ReactNode
  help?: ReactNode
  value: string
  onChange: (value: string) => void
  options: OptionCardItem[]
  /** true → cartões compactos sem ícone (faixa etária) */
  plain?: boolean
}

/**
 * Seleção em cartões (uma escolha). Ex.: gênero (com ícone), faixa etária (plain).
 * Selecionado = borda roxa + anel lavanda.
 */
export function OptionCardGroup({
  label,
  hint,
  help,
  value,
  onChange,
  options,
  plain = false,
}: OptionCardGroupProps) {
  return (
    <Field as="fieldset" label={label} hint={hint} help={help}>
      <div className="qtr-optcards">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`qtr-optcard${plain ? ' qtr-optcard--plain' : ''}${
              value === o.value ? ' is-selected' : ''
            }`}
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {!plain && o.icon && (
              <span className="qtr-optcard-icon">
                <Icon name={o.icon} size={32} strokeWidth={1.8} />
              </span>
            )}
            <span className="qtr-optcard-label">{o.label}</span>
            {o.sub && <span className="qtr-optcard-sub">{o.sub}</span>}
          </button>
        ))}
      </div>
    </Field>
  )
}
