import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { CarrinhoProvider } from './lib/carrinho'
import { Layout } from './components/Layout'
import { MatchEleitoral2026 } from './pages/MatchEleitoral2026'
import { CaminhoPerfil } from './pages/CaminhoPerfil'
import { CaminhoCurriculo } from './pages/CaminhoCurriculo'
import { CaminhoRelacionamento } from './pages/CaminhoRelacionamento'
import { DesignSystem } from './pages/DesignSystem'
import './ui/index.css'
import './style-guide.css'
import './styles.css'

const router = createBrowserRouter([
  // /design — vitrine do QTR.UI, sem o "shell" do app.
  { path: '/design', element: <DesignSystem /> },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/match-eleitoral-2026" replace /> },
      { path: '/match-eleitoral-2026', element: <MatchEleitoral2026 /> },
      { path: '/match-eleitoral-2026/perfil', element: <CaminhoPerfil /> },
      { path: '/match-eleitoral-2026/curriculo', element: <CaminhoCurriculo /> },
      { path: '/match-eleitoral-2026/relacionamento', element: <CaminhoRelacionamento /> },
      { path: '*', element: <Navigate to="/match-eleitoral-2026" replace /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CarrinhoProvider>
      <RouterProvider router={router} />
    </CarrinhoProvider>
  </StrictMode>,
)
