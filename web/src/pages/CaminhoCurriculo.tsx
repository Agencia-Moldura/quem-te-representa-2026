import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { CheckGroup, Field } from '../components/Campos'
import { ResultadoLista } from '../components/ResultadoLista'
import { buscarPorCurriculo, ocupacoesDisponiveis } from '../lib/api'
import type { ResultadoBusca } from '../lib/api'
import { FAIXAS_PATRIMONIO, OCUPACOES_COMUNS, ORDENACOES } from '../lib/constants'
import type { OpcaoOcupacao, Ordenacao } from '../lib/constants'
import { useContexto } from '../lib/contexto'

const OPCOES_FAIXA = FAIXAS_PATRIMONIO.map((f) => ({ value: f.id, label: f.label }))

// grupo de profissão tem candidato no recorte atual?
function grupoExiste(op: OpcaoOcupacao, valores: string[]): boolean {
  if ((op.exatos ?? []).some((v) => valores.includes(v))) return true
  return (op.prefixos ?? []).some((p) => valores.some((v) => v.startsWith(p)))
}

export function CaminhoCurriculo() {
  const { uf, cargo } = useContexto()

  const [ocupacoes, setOcupacoes] = useState<string[]>([])
  const [faixas, setFaixas] = useState<string[]>([])
  const [reeleicao, setReeleicao] = useState(false)
  const [ordenar, setOrdenar] = useState<Ordenacao>('patrimonio')

  const [dispOcup, setDispOcup] = useState<string[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoBusca | null>(null)

  useEffect(() => {
    setDispOcup(null)
    if (!uf) return
    ocupacoesDisponiveis({ uf, cargo: cargo || undefined })
      .then(setDispOcup)
      .catch(() => setDispOcup([]))
  }, [uf, cargo])

  // limpa seleções de profissão que não existem mais no recorte
  const gruposVisiveis = useMemo(() => {
    if (!dispOcup) return OCUPACOES_COMUNS
    return OCUPACOES_COMUNS.filter((op) => grupoExiste(op, dispOcup))
  }, [dispOcup])

  useEffect(() => {
    const ids = new Set(gruposVisiveis.map((g) => g.id))
    setOcupacoes((sel) => sel.filter((id) => ids.has(id)))
  }, [gruposVisiveis])

  if (!uf) return <Navigate to="/match-eleitoral-2026" replace />

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)
    try {
      setResultado(
        await buscarPorCurriculo({
          uf: uf || undefined,
          cargo: cargo || undefined,
          ocupacoes,
          faixasPatrimonio: faixas,
          reeleicao,
          ordenar,
        }),
      )
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro na busca')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section>
      <CaminhoHeader
        n="2"
        titulo="Currículo"
        sub="Profissão declarada e patrimônio (soma dos bens no registro). Marque quantas opções quiser — o filtro é por união."
      />

      <form className="filtros filtros-checks" onSubmit={buscar}>
        <CheckGroup
          label="Profissão"
          hint={dispOcup ? '(só as que existem para este cargo/estado)' : '(carregando…)'}
          options={gruposVisiveis.map((o) => ({ value: o.id, label: o.label }))}
          selected={ocupacoes}
          onChange={setOcupacoes}
        />
        <CheckGroup
          label="Faixa de patrimônio"
          hint="(qualquer uma das marcadas)"
          options={OPCOES_FAIXA}
          selected={faixas}
          onChange={setFaixas}
        />

        <div className="filtros-rodape">
          <Field label="Ordenar por">
            <select
              className="field-select"
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value as Ordenacao)}
            >
              {ORDENACOES.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </Field>
          <label className="field field-check">
            <input type="checkbox" checked={reeleicao} onChange={(e) => setReeleicao(e.target.checked)} />
            <span>Concorrendo à reeleição</span>
          </label>
          <button className="btn-buscar" type="submit" disabled={carregando}>
            {carregando ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
      </form>

      <div className="aviso-fase2">
        <strong>Eleições anteriores / cargos já exercidos</strong> — ainda não carregado.
        Entra na Fase 2 (cruzamento de candidaturas de 2018–2024 por CPF).
        O campo <code>st_reeleicao</code> do TSE também só deve ser preenchido mais perto do pleito.
      </div>

      {erro && <p className="erro">{erro}</p>}
      {resultado && (
        <ResultadoLista candidatos={resultado.lista} totalFiltrado={resultado.totalFiltrado} total={resultado.total} />
      )}
    </section>
  )
}
