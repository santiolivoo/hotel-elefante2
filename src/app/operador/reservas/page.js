'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  Users,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

const statusConfig = {
  'PENDING_PAYMENT': {
    label: 'Pendiente de Pago',
    variant: 'warning',
    color: 'bg-yellow-100 text-yellow-800'
  },
  'CONFIRMED': {
    label: 'Confirmada',
    variant: 'success',
    color: 'bg-green-100 text-green-800'
  },
  'CANCELLED': {
    label: 'Cancelada',
    variant: 'destructive',
    color: 'bg-red-100 text-red-800'
  },
  'COMPLETED': {
    label: 'Completada',
    variant: 'secondary',
    color: 'bg-gray-100 text-gray-800'
  }
}

export default function OperadorReservasPage() {
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: 'all'
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchReservations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reservations, filters])

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/admin/reservations')
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

  const applyFilters = () => {
    let filtered = [...reservations]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(reservation =>
        reservation.user.name.toLowerCase().includes(searchLower) ||
        reservation.user.email.toLowerCase().includes(searchLower) ||
        reservation.room.number.toString().includes(searchLower) ||
        reservation.id.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(reservation => reservation.status === filters.status)
    }

    // Date range filter usando UTC para evitar problemas de timezone
    const todayStr = new Date().toISOString().split('T')[0]
    
    if (filters.dateRange === 'today') {
      filtered = filtered.filter(reservation => {
        const checkInStr = new Date(reservation.checkIn).toISOString().split('T')[0]
        return checkInStr === todayStr
      })
    } else if (filters.dateRange === 'upcoming') {
      filtered = filtered.filter(reservation => {
        const checkInStr = new Date(reservation.checkIn).toISOString().split('T')[0]
        return checkInStr > todayStr
      })
    } else if (filters.dateRange === 'current') {
      filtered = filtered.filter(reservation => {
        const checkInStr = new Date(reservation.checkIn).toISOString().split('T')[0]
        const checkOutStr = new Date(reservation.checkOut).toISOString().split('T')[0]
        return checkInStr <= todayStr && checkOutStr > todayStr
      })
    } else if (filters.dateRange === 'custom' && filters.customDateFrom && filters.customDateTo) {
      filtered = filtered.filter(reservation => {
        const checkInStr = new Date(reservation.checkIn).toISOString().split('T')[0]
        return checkInStr >= filters.customDateFrom && checkInStr <= filters.customDateTo
      })
    }

    setFilteredReservations(filtered)
  }

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: 'Estado actualizado',
          description: 'El estado de la reserva ha sido actualizado',
        })
        fetchReservations()
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el estado',
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

  const getStats = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    
    return {
      total: reservations.length,
      checkInsToday: reservations.filter(r => {
        const checkInStr = new Date(r.checkIn).toISOString().split('T')[0]
        return checkInStr === todayStr
      }).length,
      checkOutsToday: reservations.filter(r => {
        const checkOutStr = new Date(r.checkOut).toISOString().split('T')[0]
        return checkOutStr === todayStr
      }).length,
      pending: reservations.filter(r => r.status === 'PENDING_PAYMENT').length
    }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
        <p className="text-gray-600">Administra todas las reservas del hotel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-ins Hoy</p>
                <p className="text-2xl font-bold text-green-600">{stats.checkInsToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-outs Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{stats.checkOutsToday}</p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <CreditCard className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nombre, email, habitación..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDING_PAYMENT">Pendiente de Pago</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  <SelectItem value="COMPLETED">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateRange">Período</Label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="upcoming">Próximas</SelectItem>
                  <SelectItem value="current">Actuales</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filtro de fechas personalizado */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="customDateFrom">Check-in desde</Label>
                <Input
                  id="customDateFrom"
                  type="date"
                  value={filters.customDateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, customDateFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="customDateTo">Check-in hasta</Label>
                <Input
                  id="customDateTo"
                  type="date"
                  value={filters.customDateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, customDateTo: e.target.value }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Reservas ({filteredReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Huésped</TableHead>
                  <TableHead>Habitación</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-mono text-sm">
                      {reservation.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.user.name}</div>
                        <div className="text-sm text-gray-500">{reservation.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">#{reservation.room.number}</div>
                        <div className="text-sm text-gray-500">{reservation.room.roomType.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(reservation.checkIn)}</TableCell>
                    <TableCell>{formatDate(reservation.checkOut)}</TableCell>
                    <TableCell>
                      <Select 
                        value={reservation.status} 
                        onValueChange={(value) => updateReservationStatus(reservation.id, value)}
                      >
                        <SelectTrigger className="w-[160px]">
                          <Badge variant={statusConfig[reservation.status].variant} className="w-full justify-center">
                            {statusConfig[reservation.status].label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING_PAYMENT">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                              <span>Pendiente de Pago</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="CONFIRMED">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-600"></div>
                              <span>Confirmada</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="COMPLETED">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                              <span>Completada</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="CANCELLED">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-600"></div>
                              <span>Cancelada</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(reservation.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReservation(reservation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles de la Reserva</DialogTitle>
                            </DialogHeader>
                            {selectedReservation && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Información del Huésped</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                                        {selectedReservation.user.name}
                                      </div>
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                        {selectedReservation.user.email}
                                      </div>
                                      <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                                        {selectedReservation.guests} huésped{selectedReservation.guests > 1 ? 'es' : ''}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Información de la Habitación</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                        Habitación #{selectedReservation.room.number}
                                      </div>
                                      <div>{selectedReservation.room.roomType.name}</div>
                                      <div>Piso {selectedReservation.room.floor}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Fechas y Pagos</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <div>Check-in: {formatDate(selectedReservation.checkIn)}</div>
                                      <div>Check-out: {formatDate(selectedReservation.checkOut)}</div>
                                      <div>Reservado: {formatDateTime(selectedReservation.createdAt)}</div>
                                    </div>
                                    <div>
                                      <div>Total: {formatCurrency(selectedReservation.totalAmount)}</div>
                                      <div>Pagado: {formatCurrency(selectedReservation.paidAmount)}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pt-4 border-t">
                                  <Label htmlFor="status-select">Cambiar Estado</Label>
                                  <Select 
                                    value={selectedReservation.status} 
                                    onValueChange={(value) => {
                                      updateReservationStatus(selectedReservation.id, value)
                                    }}
                                  >
                                    <SelectTrigger id="status-select" className="w-full mt-2">
                                      <Badge variant={statusConfig[selectedReservation.status].variant} className="w-full justify-center">
                                        {statusConfig[selectedReservation.status].label}
                                      </Badge>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PENDING_PAYMENT">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                                          <span>Pendiente de Pago</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="CONFIRMED">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                          <span>Confirmada</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="COMPLETED">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                          <span>Completada</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="CANCELLED">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                          <span>Cancelada</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredReservations.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron reservas
              </h3>
              <p className="text-gray-600">
                No hay reservas que coincidan con los filtros seleccionados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
