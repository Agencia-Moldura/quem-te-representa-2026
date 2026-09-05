import { useState } from 'react'
import { useCarrinho } from '../lib/carrinho'
import type { ItemLista } from '../lib/carrinho'
import { iniciais, titulo } from '../lib/format'

function Foto({ item, className }: { item: ItemLista; className: string }) {
  const [erro, setErro] = useState(false)
  if (item.foto_url && !erro) {
    return <img className={className} src={item.foto_url} alt="" onError={() => setErro(true)} />
  }
  return <span className={`${className} cr-foto--vazia`}>{iniciais(item.nome)}</span>
}

export function Carrinho() {
  const { itens, remover, limpar } = useCarrinho()
  const [aberto, setAberto] = useState(false)

  if (itens.length === 0) return null

  return (
    <>
      {/* trilho estreito na lateral direita */}
      <div className="cr-trilho">
        <button
          type="button"
          className="cr-trilho-topo"
          onClick={() => setAberto(true)}
          aria-label="abrir sua lista"
        >
          <span className="cr-trilho-n">{itens.length}</span>
          sua lista
        </button>
        <div className="cr-trilho-fotos">
          {[...itens].reverse().map((i) => (
            <button
              key={i.sq}
              type="button"
              className="cr-mini"
              title={`${titulo(i.nome)} — ver / remover`}
              onClick={() => setAberto(true)}
            >
              <Foto item={i} className="cr-foto" />
              <span className="cr-mini-nr">{i.nr ?? ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* gaveta */}
      {aberto && (
        <>
          <div className="cr-overlay" onClick={() => setAberto(false)} />
          <aside className="cr-gaveta">
            <div className="cr-gaveta-topo">
              <strong>Sua lista · {itens.length}</strong>
              <div className="cr-gaveta-acoes">
                <button type="button" className="link-inline" onClick={limpar}>limpar tudo</button>
                <button type="button" className="cr-fechar" onClick={() => setAberto(false)} aria-label="fechar">×</button>
              </div>
            </div>
            <p className="cr-gaveta-nota">
              Salva só nesta sessão do navegador. Acompanha você entre os cargos.
            </p>
            <ul className="cr-gaveta-lista">
              {[...itens].reverse().map((i) => (
                <li key={i.sq}>
                  <Foto item={i} className="cr-foto cr-foto--g" />
                  <span className="cr-gaveta-nome">
                    <strong>{titulo(i.nome)}</strong>
                    <span>{i.nr ? `${i.nr} · ` : ''}{i.partido} · {titulo(i.cargo)} {i.uf}</span>
                  </span>
                  <button
                    type="button"
                    className="cr-remover"
                    aria-label="remover"
                    onClick={() => remover(i.sq)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </>
      )}
    </>
  )
}
