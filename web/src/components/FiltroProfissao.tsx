import { useEffect, useMemo, useState } from 'react'
import { ocupacoesDisponiveis } from '../lib/api'
import { grupoOcupacaoExiste, OCUPACOES_COMUNS } from '../lib/constants'
import { TagToggleGroup } from '../ui'

interface Props {
  uf: string
  cargo: string
  value: string[]
  onChange: (next: string[]) => void
}

/**
 * Filtro de profissão (multi-seleção, união) que só mostra os grupos com
 * candidato no recorte cargo/estado — nada de opção zerada. Autocontido: dá pra
 * jogar em qualquer caminho.
 */
export function FiltroProfissao({ uf, cargo, value, onChange }: Props) {
  const [dispOcup, setDispOcup] = useState<string[] | null>(null)

  useEffect(() => {
    setDispOcup(null)
    if (!uf) return
    ocupacoesDisponiveis({ uf, cargo: cargo || undefined })
      .then(setDispOcup)
      .catch(() => setDispOcup([]))
  }, [uf, cargo])

  const gruposVisiveis = useMemo(() => {
    if (!dispOcup) return OCUPACOES_COMUNS
    return OCUPACOES_COMUNS.filter((op) => grupoOcupacaoExiste(op, dispOcup))
  }, [dispOcup])

  // some seleções que não existem mais no recorte
  useEffect(() => {
    const ids = new Set(gruposVisiveis.map((g) => g.id))
    const podados = value.filter((id) => ids.has(id))
    if (podados.length !== value.length) onChange(podados)
  }, [gruposVisiveis, value, onChange])

  return (
    <TagToggleGroup
      label="Profissão"
      hint={dispOcup ? 'só as que existem para este cargo/estado' : 'carregando…'}
      value={value}
      onChange={onChange}
      options={gruposVisiveis.map((o) => ({ value: o.id, label: o.label }))}
    />
  )
}
