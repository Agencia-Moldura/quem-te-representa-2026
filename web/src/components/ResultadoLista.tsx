import { Fragment, useEffect, useState } from 'react'
import type { CabecaChapa, RelacoesExecutivas } from '../lib/api'
import { relacoesExecutivas } from '../lib/api'
import type { Candidato } from '../types'
import { brl, iniciais, nomeExibicao, titulo, urlPerfilTse } from '../lib/format'

type ExtraChips = (c: Candidato) => string[]

const ESCOLARIDADE: Record<string, string> = {
  'SUPERIOR COMPLETO': 'Ensino Superior',
  'SUPERIOR INCOMPLETO': 'Ensino Superior Incompleto',
  'ENSINO MÉDIO COMPLETO': 'Ensino Médio',
  'ENSINO MÉDIO INCOMPLETO': 'Ensino Médio Incompleto',
  'ENSINO FUNDAMENTAL COMPLETO': 'Ensino Fundamental',
  'ENSINO FUNDAMENTAL INCOMPLETO': 'Ensino Fundamental Incompleto',
  'LÊ E ESCREVE': 'Lê e escreve',
  'ANALFABETO': 'Analfabeto',
}

function escolaridade(s: string | null): string {
  if (!s || s === 'NÃO DIVULGÁVEL') return 'Não informada'
  return ESCOLARIDADE[s] ?? titulo(s)
}

function situacao(s: string | null): { txt: string; tipo: 'ok' | 'warn' | 'bad' | 'neutral' } | null {
  if (!s) return null
  if (s.startsWith('DEFERIDO')) return { txt: 'Deferido', tipo: 'ok' }
  if (s.startsWith('INDEFERIDO')) return { txt: 'Indeferido', tipo: 'bad' }
  if (s.includes('RENÚNCIA')) return { txt: 'Renúncia', tipo: 'neutral' }
  if (s.includes('CANCELAD')) return { txt: 'Cancelado', tipo: 'bad' }
  if (s.includes('AGUARDANDO') || s.includes('PENDENTE')) return { txt: 'Aguardando julgamento', tipo: 'warn' }
  return { txt: titulo(s), tipo: 'neutral' }
}

function limpo(v: string | null): string | null {
  return !v || v === 'NÃO DIVULGÁVEL' || v === '#NE' ? null : v
}

const SEM_CHAPA = new Set(['PRESIDENTE', 'VICE-PRESIDENTE'])

function Avatar({ url, nome }: { url: string | null; nome: string }) {
  const [erro, setErro] = useState(false)
  if (url && !erro) {
    return (
      <img className="mini-foto" src={url} alt="" loading="lazy" onError={() => setErro(true)} />
    )
  }
  return <span className="mini-foto mini-foto--vazia">{iniciais(nome)}</span>
}

function Fato({ k, v }: { k: string; v: string | null }) {
  return (
    <div className="cand-fato">
      <span className="cand-fato-k">{k}</span>
      <span className="cand-fato-v">{v || '—'}</span>
    </div>
  )
}

function ChapaLinha({ c, papel }: { c: CabecaChapa; papel: string }) {
  return (
    <li className="cand-chapa-item">
      <Avatar url={c.foto_url} nome={c.nm_urna_candidato || c.nm_candidato} />
      <span className="cand-chapa-nome">{titulo(c.nm_urna_candidato || c.nm_candidato)}</span>
      <span className="cand-chapa-papel">{papel}{c.sg_partido ? ` · ${c.sg_partido}` : ''}</span>
    </li>
  )
}

function ChapasAliadas({ c, rel }: { c: Candidato; rel: RelacoesExecutivas | null }) {
  if (SEM_CHAPA.has(c.ds_cargo)) return null
  if (!rel) return <div className="cand-chapa cand-chapa--carregando">carregando chapa…</div>
  const partido = c.sg_partido ?? '—'
  const govs = rel.governadores.filter(
    (g) => g.sg_uf === c.sg_uf && g.partidos.includes(partido) && g.sq_candidato !== c.sq_candidato,
  )
  const pres = rel.presidentes.filter(
    (p) => p.partidos.includes(partido) && p.sq_candidato !== c.sq_candidato,
  )

  return (
    <div className="cand-chapa">
      <span className="cand-chapa-titulo">Cabeça de chapa aliada</span>
      {govs.length === 0 && pres.length === 0 ? (
        <p className="cand-chapa-vazio">
          O {partido} não tem candidatura ao governo de {c.sg_uf} nem à presidência na mesma coligação.
        </p>
      ) : (
        <ul className="cand-chapa-lista">
          {govs.map((g) => (
            <ChapaLinha key={g.sq_candidato} c={g} papel={`governo ${g.sg_uf}`} />
          ))}
          {pres.map((p) => (
            <ChapaLinha key={p.sq_candidato} c={p} papel="presidência" />
          ))}
        </ul>
      )}
    </div>
  )
}

function CandidatoCard({
  c,
  extraChips,
  rel,
}: {
  c: Candidato
  extraChips?: ExtraChips
  rel: RelacoesExecutivas | null
}) {
  const extras = extraChips?.(c) ?? []
  const sit = situacao(c.ds_situacao_julgamento)
  const [fotoErro, setFotoErro] = useState(false)

  const temFoto = !!c.foto_url && !fotoErro

  return (
    <li className="cand-cell">
    <a
      className={`cand-card${temFoto ? ' com-foto' : ''}`}
      href={urlPerfilTse(c)}
      target="_blank"
      rel="noopener noreferrer"
      title={`Ver ${nomeExibicao(c)} no DivulgaCandContas do TSE`}
    >
      {temFoto && (
        <img
          className="cand-foto"
          src={c.foto_url!}
          alt={nomeExibicao(c)}
          loading="lazy"
          onError={() => setFotoErro(true)}
        />
      )}

      {extras.length > 0 && (
        <div className="cand-ribbon">
          {extras.map((e) => (
            <span key={e} className="cand-ribbon-item">{e}</span>
          ))}
        </div>
      )}

      <div className="cand-topo">
        <span className="cand-numero">{c.nr_candidato || '—'}</span>
        <span className="cand-sigla">{c.sg_partido || '—'}</span>
        {c.st_reeleicao === 'S' && <span className="cand-reeleicao">reeleição</span>}
      </div>

      <div className="cand-nome" title={titulo(c.nm_candidato)}>{nomeExibicao(c)}</div>
      {c.nm_urna_candidato && c.nm_urna_candidato !== c.nm_candidato && (
        <div className="cand-nome-full">{titulo(c.nm_candidato)}</div>
      )}
      <div className="cand-cargo">
        {titulo(c.ds_cargo)} · {c.sg_uf}
      </div>
      {c.nm_coligacao && (
        <div className="cand-colig" title={c.ds_composicao_coligacao ?? ''}>{titulo(c.nm_coligacao)}</div>
      )}

      <div className="cand-facts">
        <Fato k="idade" v={c.idade != null ? `${c.idade} anos` : null} />
        <Fato k="gênero" v={titulo(limpo(c.ds_genero))} />
        <Fato k="cor/raça" v={titulo(limpo(c.ds_cor_raca))} />
        <Fato k="estado civil" v={titulo(limpo(c.ds_estado_civil))} />
      </div>

      <div className="cand-linha">
        <span className="cand-linha-k">escolaridade</span>
        <span className="cand-linha-v">{escolaridade(c.ds_grau_instrucao)}</span>
      </div>
      <div className="cand-linha">
        <span className="cand-linha-k">ocupação</span>
        <span className="cand-linha-v" title={titulo(c.ds_ocupacao)}>
          {limpo(c.ds_ocupacao) ? titulo(c.ds_ocupacao) : 'Não informada'}
        </span>
      </div>

      <div className="cand-rodape">
        <span className="cand-bens">
          {c.valor_total_bens != null ? brl(c.valor_total_bens) : 'sem bens declarados'}
          {c.qtd_bens ? <span className="cand-bens-sub"> · {c.qtd_bens} bens</span> : null}
        </span>
        {sit && <span className={`cand-situacao cand-situacao--${sit.tipo}`}>{sit.txt}</span>}
      </div>

      <ChapasAliadas c={c} rel={rel} />

      <span className="cand-tse">ver no TSE ↗</span>
    </a>
    </li>
  )
}

interface Props {
  candidatos: Candidato[]
  agruparPorCargo?: boolean
  truncadoEm?: number
  extraChips?: ExtraChips
}

function Contagem({ n, truncado }: { n: number; truncado: boolean }) {
  return (
    <p className="contagem">
      {n} candidato{n === 1 ? '' : 's'}
      {truncado ? ' · limite atingido, refine os filtros' : ''}
    </p>
  )
}

export function ResultadoLista({ candidatos, agruparPorCargo, truncadoEm, extraChips }: Props) {
  const [rel, setRel] = useState<RelacoesExecutivas | null>(null)

  useEffect(() => {
    setRel(null)
    if (candidatos.length === 0) return
    const ufs = [...new Set(candidatos.map((c) => c.sg_uf))]
    let vivo = true
    relacoesExecutivas(ufs)
      .then((r) => vivo && setRel(r))
      .catch(() => vivo && setRel({ governadores: [], presidentes: [] }))
    return () => {
      vivo = false
    }
  }, [candidatos])

  if (candidatos.length === 0) {
    return <p className="vazio">Nenhum candidato para esses filtros.</p>
  }

  const truncado = truncadoEm != null && candidatos.length >= truncadoEm

  if (agruparPorCargo) {
    const grupos = new Map<string, Candidato[]>()
    for (const c of candidatos) {
      const arr = grupos.get(c.ds_cargo) ?? []
      arr.push(c)
      grupos.set(c.ds_cargo, arr)
    }
    return (
      <div>
        <Contagem n={candidatos.length} truncado={truncado} />
        {[...grupos.entries()].map(([cargo, lista]) => (
          <Fragment key={cargo}>
            <h3 className="grupo-titulo">
              {cargo} <span className="grupo-count">{lista.length}</span>
            </h3>
            <ul className="cand-grid">
              {lista.map((c) => (
                <CandidatoCard key={c.sq_candidato} c={c} extraChips={extraChips} rel={rel} />
              ))}
            </ul>
          </Fragment>
        ))}
      </div>
    )
  }

  return (
    <div>
      <Contagem n={candidatos.length} truncado={truncado} />
      <ul className="cand-grid">
        {candidatos.map((c) => (
          <CandidatoCard key={c.sq_candidato} c={c} extraChips={extraChips} rel={rel} />
        ))}
      </ul>
    </div>
  )
}
