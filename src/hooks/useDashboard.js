import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

export function useDashboard(selectedYear) {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['dashboard', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/admin/dashboard?year=${selectedYear}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar datos del dashboard')
      }

      return response.json()
    },
    staleTime: 60 * 1000, // 1 minuto - datos frescos
    cacheTime: 10 * 60 * 1000, // 10 minutos en caché
    refetchInterval: 2 * 60 * 1000, // Refetch automático cada 2 minutos para stats en vivo
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar datos del dashboard',
        variant: 'destructive',
      })
    }
  })
}
