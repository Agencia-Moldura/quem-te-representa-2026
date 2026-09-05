import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { CaminhoHeader } from '../components/CaminhoHeader'
import { CheckGroup, Field, Select } from '../components/Campos'
import { MaisFiltros } from '../components/MaisFiltros'
import { ResultadoLista } from '../components/ResultadoLista'
import { buscarCandidatos, ocupacoesDisponiveis } from '../lib/api'
import type { FiltroCandidatos, ResultadoBusca } from '../lib/api'
import {
  CORES_RACA,
  FAIXAS_IDADE,
  FAIXAS_PATRIMONIO,
  GENEROS,
  GRAUS_INSTRUCAO,
  OCUPACOES_COMUNS,
  ORDENACOES,
  SITUACOES,
} from '../lib/constants'
import type { OpcaoOcupacao, Ordenacao } from '../lib/constants'
import { useContexto } from '../lib/contexto'

const OPCOES_FAIXA = FAIXAS_PATRIMONIO.map((f) => ({ value: f.id, label: f.label }))
const OP_IDADE = FAIXAS_IDADE.map((f) => ({ value: f.id, label: f.label }))
const OP_GRAU = GRAUS_INSTRUCAO.map(([v, l]) => ({ value: v, label: l }))

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

  // mais filtros
  const [faixasIdade, setFaixasIdade] = useState<string[]>([])
  const [genero, setGenero] = useState('')
  const [corRaca, setCorRaca] = useState('')
  const [escolaridades, setEscolaridades] = useState<string[]>([])
  const [situacao, setSituacao] = useState<FiltroCandidatos['situacao']>('')

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
        await buscarCandidatos({
          uf: uf || undefined,
          cargo: cargo || undefined,
          ocupacoes,
          faixasPatrimonio: faixas,
          reeleicao,
          ordenar,
          faixasIdade,
          genero: genero || undefined,
          corRaca: corRaca || undefined,
          escolaridades,
          situacao,
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

        <MaisFiltros caminho="Currículo">
          <CheckGroup label="Faixa de idade" hint="(qualquer uma)" options={OP_IDADE}
            selected={faixasIdade} onChange={setFaixasIdade} />
          <CheckGroup label="Escolaridade" hint="(qualquer uma)" options={OP_GRAU}
            selected={escolaridades} onChange={setEscolaridades} />
          <div className="filtros-rodape">
            <Field label="Gênero">
              <Select value={genero} onChange={setGenero} options={GENEROS} placeholder="todos" />
            </Field>
            <Field label="Cor/raça">
              <Select value={corRaca} onChange={setCorRaca} options={CORES_RACA} placeholder="todas" />
            </Field>
            <Field label="Situação da candidatura">
              <select className="field-select" value={situacao}
                onChange={(e) => setSituacao(e.target.value as FiltroCandidatos['situacao'])}>
                {SITUACOES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </MaisFiltros>
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
