import { Link, Outlet } from 'react-router-dom'
import { Carrinho } from './Carrinho'
import { FiltroGlobal } from './FiltroGlobal'

export function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to={{ pathname: '/match-eleitoral-2026' }} className="brand">
          match&nbsp;eleitoral <span className="brand-year">2026</span>
        </Link>
        <span className="topbar-sub">
          base pesquisável de candidaturas · dados do TSE
        </span>
      </header>

      <FiltroGlobal />

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        Fonte: Portal de Dados Abertos do TSE — Candidatos 2026 (arquivo de 05/09/2026).
        Suplentes de senador ficam de fora. Protótipo preliminar.
      </footer>

      <Carrinho />
    </div>
  )
}
