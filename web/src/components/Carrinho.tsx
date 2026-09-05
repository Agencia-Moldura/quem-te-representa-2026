import { useState } from 'react'
import { useCarrinho } from '../lib/carrinho'
import type { ItemLista } from '../lib/carrinho'
import { iniciais, titulo } from '../lib/format'

const MAX_LEQUE = 9
const SPREAD = 82 // graus totais do leque

function Foto({ item }: { item: ItemLista }) {
  const [erro, setErro] = useState(false)
  if (item.foto_url && !erro) {
    return <img className="cr-foto" src={item.foto_url} alt="" onError={() => setErro(true)} />
  }
  return <span className="cr-foto cr-foto--vazia">{iniciais(item.nome)}</span>
}

export function Carrinho() {
  const { itens, remover, limpar } = useCarrinho()
  const [aberto, setAberto] = useState(false)

  if (itens.length === 0) return null

  const leque = itens.slice(-MAX_LEQUE)
  const extra = itens.length - leque.length
  const n = leque.length

  return (
    <div className={`carrinho${aberto ? ' is-aberto' : ''}`}>
      {aberto && (
        <div className="cr-painel">
          <div className="cr-painel-topo">
            <strong>Sua lista · {itens.length}</strong>
            <button type="button" className="link-inline" onClick={limpar}>limpar tudo</button>
          </div>
          <ul className="cr-painel-lista">
            {[...itens].reverse().map((i) => (
              <li key={i.sq}>
                <Foto item={i} />
                <span className="cr-painel-nome">
                  <strong>{titulo(i.nome)}</strong>
                  <span>{i.nr ? `${i.nr} · ` : ''}{i.partido} · {titulo(i.cargo)} {i.uf}</span>
                </span>
                <button type="button" className="cr-remover" aria-label="remover" onClick={() => remover(i.sq)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="cr-leque" style={{ ['--n' as string]: n }}>
        {leque.map((i, idx) => {
          const ang = n === 1 ? 0 : -SPREAD / 2 + (idx * SPREAD) / (n - 1)
          return (
            <button
              key={i.sq}
              type="button"
              className="cr-carta"
              style={{ ['--ang' as string]: `${ang}deg` }}
              title={`${titulo(i.nome)} — clique para remover`}
              onClick={() => remover(i.sq)}
            >
              <Foto item={i} />
              <span className="cr-carta-nome">{i.nr ?? ''}</span>
            </button>
          )
        })}
      </div>

      <button type="button" className="cr-alca" onClick={() => setAberto((v) => !v)}>
        <span className="cr-alca-n">{itens.length}</span>
        Sua lista
        {extra > 0 && <span className="cr-alca-extra">+{extra}</span>}
        <span className="cr-alca-caret">{aberto ? '▾' : '▴'}</span>
      </button>
    </div>
  )
}
