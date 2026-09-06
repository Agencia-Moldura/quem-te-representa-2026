import { Fragment, useEffect, useState } from 'react'
import type { CabecaChapa, RelacoesExecutivas } from '../lib/api'
import { relacoesExecutivas } from '../lib/api'
import { PREFIXO_VICE } from '../lib/constants'
import { useCarrinho } from '../lib/carrinho'
import type { Candidato } from '../types'
import { brl, iniciais, nomeExibicao, titulo } from '../lib/format'

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

function limpo(v: string | null): string | null {
  return !v || v === 'NÃO DIVULGÁVEL' || v === '#NE' ? null : v
}

function ehVice(c: Candidato): boolean {
  return c.ds_cargo.startsWith(PREFIXO_VICE)
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

function AddButton({ c }: { c: Candidato }) {
  const { tem, adicionar, remover } = useCarrinho()
  const naLista = tem(c.sq_candidato)
  return (
    <button
      type="button"
      className={`cand-add${naLista ? ' is-on' : ''}`}
      aria-label={naLista ? 'remover da sua lista' : 'adicionar à sua lista'}
      title={naLista ? 'na sua lista — clique para tirar' : 'adicionar à sua lista'}
      onClick={(e) => {
        e.stopPropagation()
        if (naLista) remover(c.sq_candidato)
        else adicionar(c)
      }}
    >
      <span aria-hidden="true">{naLista ? '✓' : '+'}</span>
      <span className="cand-add-txt">{naLista ? 'na lista' : 'lista'}</span>
    </button>
  )
}

/** corpo do card (tudo depois da foto) */
function CardCorpo({ c, extras, rel }: { c: Candidato; extras: string[]; rel: RelacoesExecutivas | null }) {
  return (
    <>
      {extras.length > 0 && (
        <div className="cand-ribbon">
          {extras.map((e) => (
            <span key={e} className="qtr-chip qtr-chip--media cand-ribbon-item">{e}</span>
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
      <div className="cand-cargo-linha">
        <span className="cand-cargo">{titulo(c.ds_cargo)}</span>
        <span className="cand-cargo-uf">{c.sg_uf}</span>
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
      </div>

      <ChapasAliadas c={c} rel={rel} />
    </>
  )
}

function Foto({ c, onErro }: { c: Candidato; onErro: () => void }) {
  const [erro, setErro] = useState(false)
  if (!c.foto_url || erro) return null
  return (
    <img
      className="cand-foto"
      src={c.foto_url}
      alt={nomeExibicao(c)}
      loading="lazy"
      onError={() => {
        setErro(true)
        onErro()
      }}
    />
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
  const [semFoto, setSemFoto] = useState(false)
  const comFoto = !!c.foto_url && !semFoto

  return (
    <li className="cand-cell">
      <article className={`cand-card${comFoto ? ' com-foto' : ''}`}>
        <Foto c={c} onErro={() => setSemFoto(true)} />
        <CardCorpo c={c} extras={extras} rel={rel} />
        <AddButton c={c} />
      </article>
    </li>
  )
}

// ---------- chapa: titular + vice num card só ----------
function FotoChapa({
  c,
  papel,
  onClick,
}: {
  c: Candidato
  papel: 'titular' | 'vice'
  onClick: () => void
}) {
  const [erro, setErro] = useState(false)
  const nome = nomeExibicao(c)
  const dica = `${papel}: ${nome} — clique para trocar`
  if (!c.foto_url || erro) {
    return (
      <span className="chapa-foto chapa-foto--vazia" data-papel={papel} title={dica} onClick={onClick}>
        {iniciais(nome)}
      </span>
    )
  }
  return (
    <img
      className="chapa-foto"
      data-papel={papel}
      src={c.foto_url}
      alt={dica}
      title={dica}
      loading="lazy"
      onError={() => setErro(true)}
      onClick={onClick}
    />
  )
}

function ChapaCard({
  titular,
  vice,
  extraChips,
  rel,
}: {
  titular: Candidato
  vice: Candidato
  extraChips?: ExtraChips
  rel: RelacoesExecutivas | null
}) {
  const [viceNaFrente, setViceNaFrente] = useState(false)
  const frente = viceNaFrente ? vice : titular
  const extras = extraChips?.(frente) ?? []
  const trocar = () => setViceNaFrente((v) => !v)

  return (
    <li className="cand-cell">
      <article className="cand-card com-foto cand-card--chapa">
        <div className="chapa-fotos" data-vice-frente={viceNaFrente || undefined}>
          <FotoChapa c={titular} papel="titular" onClick={trocar} />
          <FotoChapa c={vice} papel="vice" onClick={trocar} />
        </div>

        <span className="chapa-par">
          chapa · {nomeExibicao(titular)} <b>+</b> {nomeExibicao(vice)}
        </span>

        <CardCorpo c={frente} extras={extras} rel={rel} />
        <AddButton c={frente} />
      </article>
    </li>
  )
}

interface ChapaPar {
  key: string
  titular: Candidato
  vice: Candidato | null
}

// agrupa titular + vice pelo nº de urna (compartilhado na mesma UF)
function parear(cands: Candidato[]): ChapaPar[] {
  const grupos = new Map<string, Candidato[]>()
  for (const c of cands) {
    const k = `${c.sg_uf}|${c.nr_candidato}`
    const arr = grupos.get(k) ?? []
    arr.push(c)
    grupos.set(k, arr)
  }
  const pares: ChapaPar[] = []
  for (const [key, membros] of grupos) {
    const titular = membros.find((m) => !ehVice(m)) ?? membros[0]
    const vice = membros.find((m) => ehVice(m)) ?? null
    pares.push({ key, titular, vice })
  }
  return pares
}

interface Props {
  candidatos: Candidato[]
  totalFiltrado?: number
  total?: number
  agruparPorCargo?: boolean
  /** cargo agregado (presidente/governador + vice): pareia e mostra 2 fotos */
  chapa?: boolean
  extraChips?: ExtraChips
}

function Contagem({
  mostrando,
  totalFiltrado,
  total,
  unidade = 'candidato',
}: {
  mostrando: number
  totalFiltrado?: number
  total?: number
  unidade?: string
}) {
  const fmt = (x: number) => x.toLocaleString('pt-BR')
  const bate = totalFiltrado ?? mostrando
  const truncado = bate > mostrando
  return (
    <p className="contagem">
      <strong>{fmt(bate)}</strong>
      {total != null && total !== bate ? ` de ${fmt(total)}` : ''} {unidade}{bate === 1 ? '' : 's'}
      {truncado ? ` · mostrando os ${fmt(mostrando)} primeiros, refine os filtros` : ''}
    </p>
  )
}

export function ResultadoLista({
  candidatos,
  totalFiltrado,
  total,
  agruparPorCargo,
  chapa,
  extraChips,
}: Props) {
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

  // ---- chapa: pareia titular + vice, um card por chapa ----
  if (chapa) {
    const pares = parear(candidatos)
    return (
      <div>
        <Contagem mostrando={pares.length} unidade="chapa" />
        <ul className="cand-grid">
          {pares.map((p) =>
            p.vice && p.vice.sq_candidato !== p.titular.sq_candidato ? (
              <ChapaCard key={p.key} titular={p.titular} vice={p.vice} extraChips={extraChips} rel={rel} />
            ) : (
              <CandidatoCard key={p.key} c={p.titular} extraChips={extraChips} rel={rel} />
            ),
          )}
        </ul>
      </div>
    )
  }

  const contagem = (
    <Contagem mostrando={candidatos.length} totalFiltrado={totalFiltrado} total={total} />
  )

  if (agruparPorCargo) {
    const grupos = new Map<string, Candidato[]>()
    for (const c of candidatos) {
      const arr = grupos.get(c.ds_cargo) ?? []
      arr.push(c)
      grupos.set(c.ds_cargo, arr)
    }
    return (
      <div>
        {contagem}
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
      {contagem}
      <ul className="cand-grid">
        {candidatos.map((c) => (
          <CandidatoCard key={c.sq_candidato} c={c} extraChips={extraChips} rel={rel} />
        ))}
      </ul>
    </div>
  )
}
