import { rotuloOpcao } from '../lib/format'
import type { Candidato } from '../types'
import { SelectField } from '../ui'

interface Props {
  uf: string
  presis: Candidato[]
  govs: Candidato[]
  presSq: string
  setPresSq: (v: string) => void
  govSq: string
  setGovSq: (v: string) => void
}

/** os dois selects (Presidência / Governo de {UF}) do caminho de relacionamento */
export function RelacionamentoFields({
  uf,
  presis,
  govs,
  presSq,
  setPresSq,
  govSq,
  setGovSq,
}: Props) {
  return (
    <div className="filtro-form-linha">
      <SelectField
        label="Presidência"
        hint="(opcional)"
        placeholder="— nenhuma —"
        value={presSq}
        onChange={setPresSq}
        options={presis.map((p) => ({ value: p.sq_candidato, label: rotuloOpcao(p) }))}
      />
      <SelectField
        label={`Governo de ${uf}`}
        hint="(opcional)"
        placeholder="— nenhuma —"
        value={govSq}
        onChange={setGovSq}
        options={govs.map((g) => ({
          value: g.sq_candidato,
          label: g.nm_coligacao ? `${rotuloOpcao(g)} — ${g.nm_coligacao}` : rotuloOpcao(g),
        }))}
      />
    </div>
  )
}
