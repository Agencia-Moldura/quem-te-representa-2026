import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UFS } from '../lib/constants'
import { useContexto } from '../lib/contexto'

const PASSOS = [
  { n: 1, titulo: 'Escolher seu estado' },
  { n: 2, titulo: 'Selecionar um cargo' },
  { n: 3, titulo: 'Escolher seu caminho como eleitor' },
  { n: 4, titulo: 'Ver os candidatos que dão match' },
  { n: 5, titulo: 'Criar sua lista de opções', opcional: true },
]

const CAMINHOS = [
  {
    to: 'perfil',
    n: '1',
    titulo: 'Escolher pelo perfil',
    desc: 'Filtre por idade, gênero e cor/raça — quem são as pessoas na disputa.',
    filtros: ['idade', 'gênero', 'cor/raça'],
  },
  {
    to: 'curriculo',
    n: '2',
    titulo: 'Escolher por currículo',
    desc: 'Filtre por profissão declarada e patrimônio. Cargos anteriores entram numa próxima etapa.',
    filtros: ['profissão', 'patrimônio', 'eleições anteriores (em breve)'],
  },
  {
    to: 'relacionamento',
    n: '3',
    titulo: 'Escolher por relacionamento político',
    desc: 'Parta das suas escolhas para presidência e governo e veja quem está nas mesmas coligações.',
    filtros: ['coligação', 'presidência', 'governo do estado'],
  },
]

const CHAVE_COMECOU = 'me2026.comecou'

export function MatchEleitoral2026() {
  const { uf, cargo, setUf, query } = useContexto()
  const [comecou, setComecou] = useState(() => {
    try {
      return sessionStorage.getItem(CHAVE_COMECOU) === '1'
    } catch {
      return false
    }
  })

  function comecar() {
    try {
      sessionStorage.setItem(CHAVE_COMECOU, '1')
    } catch {
      /* ignore */
    }
    setComecou(true)
  }

  // ---- intro: os 5 passos + Começar ----
  if (!comecou && !uf) {
    return (
      <section className="intro">
        <h1 className="page-titulo">Encontre candidatos que combinam com você</h1>
        <p className="page-lead">
          Um jeito rápido de conhecer quem está na disputa em 2026. São 5 passos:
        </p>
        <ol className="passos">
          {PASSOS.map((p) => (
            <li key={p.n} className="passo">
              <span className="passo-n">{p.n}</span>
              <span className="passo-txt">
                {p.titulo}
                {p.opcional && <span className="passo-opc">opcional</span>}
              </span>
            </li>
          ))}
        </ol>
        <button type="button" className="btn-comecar" onClick={comecar}>
          Começar
        </button>
      </section>
    )
  }

  // ---- passo 1: escolher o estado ----
  if (!uf) {
    return (
      <section>
        <h1 className="page-titulo">Passo 1 · Qual é o seu estado?</h1>
        <p className="page-lead">Ele vale para os três caminhos de busca.</p>
        <div className="uf-grid">
          {UFS.map((u) => (
            <button key={u} type="button" className="uf-botao" onClick={() => setUf(u)}>
              {u}
              {u === 'BR' && <span className="uf-sub">presidência</span>}
            </button>
          ))}
        </div>
      </section>
    )
  }

  // ---- passos 2 e 3: cargo (barra do topo) + caminho ----
  return (
    <section>
      <h1 className="page-titulo">Passo 3 · Como você quer encontrar um candidato?</h1>
      <p className="page-lead">
        Você está vendo <strong>{cargo || 'todos os cargos'}</strong> em <strong>{uf}</strong>{' '}
        <button type="button" className="link-inline" onClick={() => setUf('')}>
          trocar estado
        </button>
        . Ajuste o <strong>cargo</strong> na barra do topo (passo 2). Agora escolha por onde começar:
      </p>

      <div className="caminhos">
        {CAMINHOS.map((c) => (
          <Link key={c.to} to={{ pathname: c.to, search: query }} className="caminho-card">
            <span className="caminho-n">Caminho {c.n}</span>
            <h2 className="caminho-titulo">{c.titulo}</h2>
            <p className="caminho-desc">{c.desc}</p>
            <div className="caminho-filtros">
              {c.filtros.map((f) => (
                <span key={f} className="chip">{f}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
