import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

// Hook para obtener reservas con filtros
export function useReservations(filters = {}, page = 1) {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['reservations', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })

      // Agregar filtros a los params
      if (filters.id) params.append('id', filters.id)
      if (filters.search) params.append('search', filters.search)
      if (filters.status && filters.status !== 'ALL') {
        params.append('status', filters.status)
      }
      if (filters.roomId && filters.roomId !== 'ALL') {
        params.append('roomId', filters.roomId)
      }
      if (filters.roomTypeId && filters.roomTypeId !== 'ALL') {
        params.append('roomTypeId', filters.roomTypeId)
      }
      
      if (filters.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange)
        
        // Si es custom, agregar las fechas personalizadas
        if (filters.dateRange === 'custom') {
          if (filters.customDateFrom) {
            params.append('customDateFrom', filters.customDateFrom)
          }
          if (filters.customDateTo) {
            params.append('customDateTo', filters.customDateTo)
          }
        }
      }

      const response = await fetch(`/api/admin/reservations?${params}`)
      
      if (!response.ok) {
        throw new Error('No se pudieron cargar las reservas')
      }

      return response.json()
    },
    staleTime: 30 * 1000, // 30 segundos - datos frescos
    cacheTime: 5 * 60 * 1000, // 5 minutos en caché
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar las reservas',
        variant: 'destructive',
      })
    }
  })
}

// Hook para actualizar estado de reserva
export function useUpdateReservationStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ reservationId, newStatus }) => {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('No se pudo actualizar el estado de la reserva')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidar todas las queries de reservations para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la reserva se actualizó correctamente',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el estado',
        variant: 'destructive',
      })
    }
  })
}
