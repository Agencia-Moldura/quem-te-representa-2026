import type { ReactNode } from 'react'

interface FieldProps {
  /** rótulo do campo */
  label?: ReactNode
  /** texto acessório em cinza, ao lado do rótulo — ex.: "(opcional)" */
  hint?: ReactNode
  /** id do controle, para o <label htmlFor> */
  htmlFor?: string
  /** ajuda abaixo do controle */
  help?: ReactNode
  /** mensagem de erro (substitui a ajuda quando presente) */
  error?: ReactNode
  /** usar <fieldset>/<legend> em vez de <label> (grupos de check/radio/tag) */
  as?: 'label' | 'fieldset'
  children: ReactNode
}

/** Envelope rótulo + controle + ajuda/erro. Espaçamento e tipografia do guia. */
export function Field({ label, hint, htmlFor, help, error, as = 'label', children }: FieldProps) {
  const head = label != null && (
    <>
      {label}
      {hint != null && <span className="qtr-label-hint"> {hint}</span>}
    </>
  )
  const rodape =
    error != null ? (
      <p className="qtr-field-error">{error}</p>
    ) : help != null ? (
      <p className="qtr-field-help">{help}</p>
    ) : null

  if (as === 'fieldset') {
    return (
      <fieldset className="qtr-field qtr-field--reset">
        {label != null && <legend className="qtr-label">{head}</legend>}
        {children}
        {rodape}
      </fieldset>
    )
  }

  return (
    <div className="qtr-field">
      {label != null && (
        <label className="qtr-label" htmlFor={htmlFor}>
          {head}
        </label>
      )}
      {children}
      {rodape}
    </div>
  )
}
