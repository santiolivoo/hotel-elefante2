'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Configuración de caché
        staleTime: 60 * 1000, // Los datos son frescos por 1 minuto
        cacheTime: 5 * 60 * 1000, // Mantener en caché por 5 minutos
        refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
        refetchOnMount: true, // Refetch al montar componente
        retry: 1, // Reintentar una vez si falla
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
