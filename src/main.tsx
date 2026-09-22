import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/sessionGuard'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initViewAsMode } from './lib/viewAsGuard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Los queryFn de este proyecto lanzan Error genéricos sin conservar el
      // status HTTP, así que no se puede distinguir un 429 de un error real
      // aquí — se baja el reintento por defecto (3 → 1) para no amplificar
      // una limitación de tasa ya activa con reintentos automáticos en cascada.
      retry: 1,
    },
  },
});

// initViewAsMode() se espera ANTES de cargar App.tsx (import dinámico, no
// estático) para que, si venimos de un link "Ver como" del admin, el perfil
// ya esté en localStorage cuando useAuth se evalúe por primera vez — si no,
// ProtectedRoute vería localStorage.user vacío por un instante y redirigiría
// a "/" antes de que terminara de cargar.
async function bootstrap() {
  await initViewAsMode()
  const { default: App } = await import('./App.tsx')

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}

bootstrap()
