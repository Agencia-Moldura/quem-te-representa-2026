import { useState } from 'react'
import { Link } from 'react-router-dom'
import { rotuloCargo, UFS } from '../lib/constants'
import { useContexto } from '../lib/contexto'
import { Button, Icon } from '../ui'
import type { IconName } from '../ui'

const CAMINHOS: {
  to: string
  n: string
  icon: IconName
  titulo: string
  desc: string
  filtros: string[]
}[] = [
  {
    to: 'perfil',
    n: '1',
    icon: 'user',
    titulo: 'Escolher pelo perfil',
    desc: 'Filtre por idade, gênero e cor/raça — quem são as pessoas na disputa.',
    filtros: ['idade', 'gênero', 'cor/raça'],
  },
  {
    to: 'curriculo',
    n: '2',
    icon: 'briefcase',
    titulo: 'Escolher por currículo',
    desc: 'Filtre por profissão declarada e patrimônio. Cargos anteriores entram numa próxima etapa.',
    filtros: ['profissão', 'patrimônio', 'eleições anteriores (em breve)'],
  },
  {
    to: 'relacionamento',
    n: '3',
    icon: 'link',
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

  // ---- intro: chamada + Começar ----
  if (!comecou && !uf) {
    return (
      <section className="intro">
        <p className="qtr-eyebrow">Match Eleitoral 2026</p>
        <h1 className="intro-titulo">Encontre candidatos que combinam com você</h1>
        <p className="page-lead">
          Um jeito rápido de conhecer quem está na disputa em 2026. Siga os passos da barra acima —
          em cerca de um minuto você chega numa lista de candidatos que fazem sentido pra você.
        </p>
        <Button icon="arrow-right" onClick={comecar}>
          Começar
        </Button>
      </section>
    )
  }

  // ---- passo 1: escolher o estado ----
  if (!uf) {
    return (
      <section>
        <p className="qtr-eyebrow">Passo 1 de 3</p>
        <h1 className="page-titulo">Qual é o seu estado?</h1>
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
      <p className="qtr-eyebrow">Passo 2 de 3</p>
      <h1 className="page-titulo">Como você quer encontrar um candidato?</h1>
      <p className="page-lead">
        Você está vendo <strong>{rotuloCargo(cargo)}</strong> em <strong>{uf}</strong>{' '}
        <button type="button" className="link-inline" onClick={() => setUf('')}>
          trocar estado
        </button>
        . Ajuste o <strong>cargo</strong> na barra do topo. Agora escolha por onde começar:
      </p>

      <div className="caminhos">
        {CAMINHOS.map((c) => (
          <Link key={c.to} to={{ pathname: c.to, search: query }} className="caminho-card qtr-card">
            <span className="caminho-icone">
              <Icon name={c.icon} size={26} strokeWidth={1.8} />
            </span>
            <span className="caminho-n">Caminho {c.n}</span>
            <h2 className="caminho-titulo">{c.titulo}</h2>
            <p className="caminho-desc">{c.desc}</p>
            <div className="caminho-filtros">
              {c.filtros.map((f) => (
                <span key={f} className="qtr-chip qtr-chip--outline">{f}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
