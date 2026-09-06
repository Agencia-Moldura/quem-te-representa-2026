export interface StepperStep {
  label: string
  /** legenda pequena abaixo do rótulo — ex.: "(opcional)" */
  opcional?: boolean
  /** força o passo como concluído mesmo estando à frente do atual */
  done?: boolean
}

interface StepperProps {
  steps: StepperStep[]
  /** índice do passo atual (base 0) */
  atual: number
  /** clicar num passo já concluído */
  onStepClick?: (index: number) => void
}

/**
 * Linha do tempo do fluxo. Passo atual = bolinha cheia com circunferência em volta;
 * concluídos = bolinha cheia; futuros = contorno.
 */
export function Stepper({ steps, atual, onStepClick }: StepperProps) {
  return (
    <div className="qtr-stepper">
      {steps.map((s, i) => {
        const completo = i < atual || (s.done === true && i !== atual)
        const estado = i === atual ? 'is-active' : completo ? 'is-complete' : 'is-upcoming'
        const clicavel = onStepClick != null && (completo || i < atual)
        const conteudo = (
          <>
            <span className="qtr-stepper-label">
              {s.label}
              {s.opcional && <span className="qtr-stepper-opt">(opcional)</span>}
            </span>
            <span className="qtr-stepper-dot" aria-hidden="true" />
          </>
        )
        return clicavel ? (
          <button
            key={s.label}
            type="button"
            className={`qtr-stepper-step ${estado}`}
            data-clickable="true"
            onClick={() => onStepClick(i)}
          >
            {conteudo}
          </button>
        ) : (
          <div
            key={s.label}
            className={`qtr-stepper-step ${estado}`}
            aria-current={i === atual ? 'step' : undefined}
          >
            {conteudo}
          </div>
        )
      })}
    </div>
  )
}
