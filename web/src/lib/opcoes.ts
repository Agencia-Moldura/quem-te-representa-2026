// Listas de opções já no formato dos componentes do QTR.UI (web/src/ui/).
// Valores = exatamente o que vai pro filtro/banco; rótulos = title-case curto.
import type { IconName, OptionCardItem, SwatchItem } from '../ui'
import {
  CORES_RACA,
  ESTADOS_CIVIS,
  FAIXAS_IDADE,
  FAIXAS_PATRIMONIO,
  GENEROS,
  GRAUS_INSTRUCAO,
  ORDENACOES,
  SITUACOES,
} from './constants'

export const OP_IDADE = FAIXAS_IDADE.map((f) => ({ value: f.id, label: f.label }))
export const OP_GRAU = GRAUS_INSTRUCAO.map(([value, label]) => ({ value, label }))
export const OP_CIVIL = ESTADOS_CIVIS.map(([value, label]) => ({ value, label }))
export const OP_PATRIMONIO = FAIXAS_PATRIMONIO.map((f) => ({ value: f.id, label: f.label }))
export const OP_ORDENACAO = ORDENACOES.map((o) => ({ value: o.id, label: o.label }))
export const OP_SITUACAO = SITUACOES.map((s) => ({ value: s.id, label: s.label }))

// Gênero em cartões com ícone. "não divulgável" usa o glifo neutro.
const ICONE_GENERO: Record<string, IconName> = {
  FEMININO: 'genero-feminino',
  MASCULINO: 'genero-masculino',
  'NÃO DIVULGÁVEL': 'genero-nao-binario',
}
export const OP_GENERO_CARDS: OptionCardItem[] = GENEROS.map((g) => ({
  value: g,
  label: g === 'NÃO DIVULGÁVEL' ? 'Não divulgável' : g.charAt(0) + g.slice(1).toLowerCase(),
  icon: ICONE_GENERO[g],
}))

// Cor/raça com disco de cor aproximando o tom de pele autodeclarado.
const COR_RACA_DISCO: Record<string, string> = {
  BRANCA: '#F3D9AA',
  PRETA: '#3D2B24',
  PARDA: '#C08A5E',
  AMARELA: '#E8CFA0',
  'INDÍGENA': '#B4703F',
  'NÃO DIVULGÁVEL': '#C7BED9',
}
export const OP_COR_RACA: SwatchItem[] = CORES_RACA.map((c) => ({
  value: c,
  label: c === 'NÃO DIVULGÁVEL' ? 'Não divulgável' : c.charAt(0) + c.slice(1).toLowerCase(),
  cor: COR_RACA_DISCO[c] ?? '#C7BED9',
}))
