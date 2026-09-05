import { useLocation } from 'react-router-dom'
import { useCarrinho } from '../lib/carrinho'
import { useContexto } from '../lib/contexto'

const PASSOS = [
  { n: 1, label: 'Estado' },
  { n: 2, label: 'Cargo' },
  { n: 3, label: 'Caminho' },
  { n: 4, label: 'Candidatos' },
  { n: 5, label: 'Sua lista', opcional: true },
]

export function Stepper() {
  const { uf } = useContexto()
  const { itens } = useCarrinho()
  const { pathname } = useLocation()
  const emCaminho = /\/(perfil|curriculo|relacionamento)$/.test(pathname)

  // passo em que a pessoa está
  const passo = uf ? (emCaminho ? 4 : 3) : 1

  return (
    <ol className="stepper">
      {PASSOS.map((s) => {
        const completo = s.n === 5 ? itens.length > 0 : s.n < passo
        const ativo = s.n === passo
        return (
          <li
            key={s.n}
            className={`stepper-step${completo ? ' is-complete' : ''}${ativo ? ' is-active' : ''}`}
          >
            <span className="stepper-dot" />
            <span className="stepper-label">
              {s.label}
              {s.opcional && <span className="stepper-opc"> (opcional)</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
