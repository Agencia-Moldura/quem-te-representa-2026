import { Link } from 'react-router-dom'
import { UFS } from '../lib/constants'
import { useContexto } from '../lib/contexto'

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

export function MatchEleitoral2026() {
  const { uf, cargo, setUf, query } = useContexto()

  if (!uf) {
    return (
      <section>
        <h1 className="page-titulo">Qual é o seu estado?</h1>
        <p className="page-lead">
          Comece pelo seu estado. Ele vale para os três caminhos de busca.
        </p>
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

  return (
    <section>
      <h1 className="page-titulo">Como você quer encontrar um candidato?</h1>
      <p className="page-lead">
        Você está vendo <strong>{cargo || 'todos os cargos'}</strong> em{' '}
        <strong>{uf}</strong>{' '}
        <button type="button" className="link-inline" onClick={() => setUf('')}>
          trocar estado
        </button>
        . O cargo se ajusta na barra do topo. Agora escolha por onde começar:
      </p>

      <div className="caminhos">
        {CAMINHOS.map((c) => (
          <Link key={c.to} to={{ pathname: c.to, search: query }} className="caminho-card">
            <span className="caminho-n">Caminho {c.n}</span>
            <h2 className="caminho-titulo">{c.titulo}</h2>
            <p className="caminho-desc">{c.desc}</p>
            <div className="caminho-filtros">
              {c.filtros.map((f) => (
                <span key={f} className="chip">
                  {f}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
