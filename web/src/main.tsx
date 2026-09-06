import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { CarrinhoProvider } from './lib/carrinho'
import { Layout } from './components/Layout'
import { MatchEleitoral2026 } from './pages/MatchEleitoral2026'
import { CaminhoPerfil } from './pages/CaminhoPerfil'
import { CaminhoCurriculo } from './pages/CaminhoCurriculo'
import { CaminhoRelacionamento } from './pages/CaminhoRelacionamento'
import './style-guide.css'
import './styles.css'

// Vitrine do design system (QTR.UI): carregada sob demanda para não pesar no
// bundle do app enquanto os componentes não são aplicados às telas.
const DesignSystem = lazy(() =>
  import('./pages/DesignSystem').then((m) => ({ default: m.DesignSystem })),
)

const router = createBrowserRouter([
  // /design — sem o "shell" do app. Provisória, para revisão.
  {
    path: '/design',
    element: (
      <Suspense fallback={null}>
        <DesignSystem />
      </Suspense>
    ),
  },
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
