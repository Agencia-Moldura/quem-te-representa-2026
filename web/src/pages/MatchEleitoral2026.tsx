import { Link } from 'react-router-dom'
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
  const { uf, cargo, query } = useContexto()

  return (
    <section>
      <h1 className="page-titulo">Como você quer encontrar um candidato?</h1>
      <p className="page-lead">
        Primeiro escolha o <strong>cargo</strong> e o <strong>estado</strong> na barra acima
        (vale para os três caminhos). Depois escolha por onde começar.
      </p>

      {(uf || cargo) && (
        <p className="contexto-atual">
          Filtrando: <strong>{cargo || 'todos os cargos'}</strong> em{' '}
          <strong>{uf || 'todo o Brasil'}</strong>
        </p>
      )}

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
