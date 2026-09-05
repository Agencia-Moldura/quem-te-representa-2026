import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from './supabase'
import type { Candidato } from '../types'

export interface ItemLista {
  sq: string
  nome: string
  nr: string | null
  partido: string | null
  cargo: string
  uf: string
  foto_url: string | null
}

interface CarrinhoCtx {
  itens: ItemLista[]
  tem: (sq: string) => boolean
  adicionar: (c: Candidato) => void
  remover: (sq: string) => void
  limpar: () => void
}

const Ctx = createContext<CarrinhoCtx | null>(null)

const CHAVE = 'me2026.lista'
const CHAVE_SID = 'me2026.sid'

function ler(): ItemLista[] {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE) ?? '[]')
  } catch {
    return []
  }
}

function sessionId(): string {
  try {
    let s = sessionStorage.getItem(CHAVE_SID)
    if (!s) {
      s = crypto.randomUUID()
      sessionStorage.setItem(CHAVE_SID, s)
    }
    return s
  } catch {
    return '00000000-0000-0000-0000-000000000000'
  }
}

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemLista[]>(ler)
  const sid = useRef<string>(sessionId())

  const salvar = useCallback((next: ItemLista[]) => {
    setItens(next)
    try {
      sessionStorage.setItem(CHAVE, JSON.stringify(next))
    } catch {
      /* sessionStorage indisponível — segue só em memória */
    }
  }, [])

  const adicionar = useCallback(
    (c: Candidato) => {
      setItens((prev) => {
        if (prev.some((i) => i.sq === c.sq_candidato)) return prev
        const item: ItemLista = {
          sq: c.sq_candidato,
          nome: c.nm_urna_candidato || c.nm_candidato,
          nr: c.nr_candidato,
          partido: c.sg_partido,
          cargo: c.ds_cargo,
          uf: c.sg_uf,
          foto_url: c.foto_url,
        }
        const next = [...prev, item]
        try {
          sessionStorage.setItem(CHAVE, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        // registra na base (log append-only; não bloqueia a UI)
        void supabase
          .from('lista_sessao')
          .insert({
            session_id: sid.current,
            sq_candidato: c.sq_candidato,
            uf: c.sg_uf,
            cargo: c.ds_cargo,
            nm_urna: item.nome,
          })
          .then(() => {}, () => {})
        return next
      })
    },
    [],
  )

  const remover = useCallback(
    (sq: string) => salvar(itens.filter((i) => i.sq !== sq)),
    [itens, salvar],
  )
  const limpar = useCallback(() => salvar([]), [salvar])
  const tem = useCallback((sq: string) => itens.some((i) => i.sq === sq), [itens])

  const value = useMemo<CarrinhoCtx>(
    () => ({ itens, tem, adicionar, remover, limpar }),
    [itens, tem, adicionar, remover, limpar],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCarrinho(): CarrinhoCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCarrinho fora do CarrinhoProvider')
  return c
}
