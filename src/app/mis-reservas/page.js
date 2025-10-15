'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Calendar, 
  Users, 
  Clock, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

const statusConfig = {
  'PENDING_PAYMENT': {
    label: 'Pendiente de Pago',
    variant: 'warning',
    icon: AlertCircle,
    color: 'text-yellow-600'
  },
  'CONFIRMED': {
    label: 'Confirmada',
    variant: 'success',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  'CANCELLED': {
    label: 'Cancelada',
    variant: 'destructive',
    icon: XCircle,
    color: 'text-red-600'
  },
  'COMPLETED': {
    label: 'Completada',
    variant: 'secondary',
    icon: CheckCircle,
    color: 'text-gray-600'
  }
}

export default function MisReservasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchReservations()
    }
  }, [status, router])

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations')
      const data = await response.json()
      
      if (response.ok) {
        setReservations(data.reservations)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las reservas',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return
    }

    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      if (response.ok) {
        toast({
          title: 'Reserva cancelada',
          description: 'Tu reserva ha sido cancelada exitosamente',
        })
        fetchReservations()
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cancelar la reserva',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      })
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const filterReservations = (status) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (status === 'all') return reservations
    if (status === 'active') return reservations.filter(r => 
      ['PENDING_PAYMENT', 'CONFIRMED'].includes(r.status) &&
      new Date(r.checkOut) >= today
    )
    if (status === 'past') return reservations.filter(r => 
      r.status === 'COMPLETED' || 
      (new Date(r.checkOut) < today && r.status !== 'CANCELLED')
    )
    return reservations.filter(r => r.status === status)
  }

  const ReservationCard = ({ reservation }) => {
    const statusInfo = statusConfig[reservation.status]
    const StatusIcon = statusInfo.icon
    const isUpcoming = new Date(reservation.checkIn) > new Date()
    const canCancel = reservation.status === 'PENDING_PAYMENT' || 
      (reservation.status === 'CONFIRMED' && isUpcoming)

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{reservation.room.roomType.name}</CardTitle>
              <p className="text-sm text-gray-600">
                Habitación #{reservation.room.number}
              </p>
            </div>
            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Check-in: {formatDate(reservation.checkIn)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Check-out: {formatDate(reservation.checkOut)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <span>{reservation.guests} huésped{reservation.guests > 1 ? 'es' : ''}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                <span>Total: {formatCurrency(reservation.totalAmount)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>Reservado: {formatDateTime(reservation.createdAt)}</span>
              </div>
              {parseFloat(reservation.paidAmount || 0) > 0 && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>Pagado: {formatCurrency(reservation.paidAmount)}</span>
                </div>
              )}
            </div>
          </div>
          
          {canCancel && (
            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleCancelReservation(reservation.id)}
              >
                Cancelar Reserva
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mis Reservas
            </h1>
            <p className="text-lg text-gray-600">
              Gestiona todas tus reservas en Hotel Elefante
            </p>
          </div>

          {/* Reservations List */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="active">Activas</TabsTrigger>
              <TabsTrigger value="past">Pasadas</TabsTrigger>
              <TabsTrigger value="CANCELLED">Canceladas</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {filterReservations(activeTab).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No tienes reservas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {activeTab === 'all' 
                        ? 'Aún no has realizado ninguna reserva.'
                        : `No tienes reservas ${activeTab === 'active' ? 'activas' : activeTab === 'past' ? 'pasadas' : 'canceladas'}.`
                      }
                    </p>
                    <Button asChild>
                      <a href="/reservar">Hacer una Reserva</a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filterReservations(activeTab).map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
