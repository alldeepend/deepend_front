import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/sessionGuard'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
