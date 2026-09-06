import { useLocation } from 'react-router-dom'
import { useCarrinho } from '../lib/carrinho'
import { useContexto } from '../lib/contexto'
import { Stepper as StepperUI } from '../ui'

const PASSOS = [
  { label: 'Estado' },
  { label: 'Cargo' },
  { label: 'Caminho' },
  { label: 'Candidatos' },
  { label: 'Sua lista', opcional: true },
]

export function Stepper() {
  const { uf } = useContexto()
  const { itens } = useCarrinho()
  const { pathname } = useLocation()
  const emCaminho = /\/(perfil|curriculo|relacionamento)$/.test(pathname)

  // passo atual (base 0): sem estado → 0; com estado e fora do caminho → 2; no caminho → 3
  const atual = uf ? (emCaminho ? 3 : 2) : 0

  const steps = PASSOS.map((p, i) =>
    i === 4 ? { ...p, done: itens.length > 0 } : p,
  )

  return (
    <nav className="stepper-wrap" aria-label="progresso">
      <StepperUI steps={steps} atual={atual} />
    </nav>
  )
}
