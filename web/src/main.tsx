import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { Layout } from './components/Layout'
import { MatchEleitoral2026 } from './pages/MatchEleitoral2026'
import { CaminhoPerfil } from './pages/CaminhoPerfil'
import { CaminhoCurriculo } from './pages/CaminhoCurriculo'
import { CaminhoRelacionamento } from './pages/CaminhoRelacionamento'
import './style-guide.css'
import './styles.css'

const router = createBrowserRouter([
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
    <RouterProvider router={router} />
  </StrictMode>,
)
