'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useReservations, useUpdateReservationStatus } from '@/hooks/useReservations'
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
  XCircle,
  ChevronLeft,
  ChevronRight
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

// Función para formatear rango de fechas desde strings YYYY-MM-DD
const formatDateRange = (dateFrom, dateTo) => {
  const [yearFrom, monthFrom, dayFrom] = dateFrom.split('-')
  const [yearTo, monthTo, dayTo] = dateTo.split('-')
  
  const dateFromObj = new Date(yearFrom, monthFrom - 1, dayFrom)
  const dateToObj = new Date(yearTo, monthTo - 1, dayTo)
  
  const fromStr = dateFromObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  const toStr = dateToObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  
  return `${fromStr} - ${toStr}`
}

function AdminReservasContent() {
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [highlightedId, setHighlightedId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const reservationRefs = useRef({})
  
  const [searchInput, setSearchInput] = useState('')
  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    status: 'ALL',
    dateRange: 'all'
  })
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    dateRange: 'all'
  })
  
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Agregar ID de reserva desde URL si existe
  const reservationIdFromUrl = searchParams.get('id')
  const queryFilters = {
    ...filters,
    id: reservationIdFromUrl || undefined
  }
  
  // Usar React Query para obtener reservas
  const { data, isLoading, refetch } = useReservations(queryFilters, currentPage)
  const updateStatusMutation = useUpdateReservationStatus()
  
  // Extraer datos de la query
  const reservations = data?.reservations || []
  const pagination = data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 }
  const globalStats = data?.stats || {
    checkInsToday: 0,
    checkOutsToday: 0,
    pendingPayments: 0,
    activeReservations: 0,
    totalReservations: 0
  }

  // Leer filtros y reserva específica de URL al cargar
  useEffect(() => {
    const statusParam = searchParams.get('status')
    const dateRangeParam = searchParams.get('dateRange')
    const reservationId = searchParams.get('id')
    
    if (statusParam || dateRangeParam) {
      const newFilters = {
        ...filters,
        status: statusParam || 'ALL',
        dateRange: dateRangeParam || 'all'
      }
      setFilters(newFilters)
      setPendingFilters(newFilters)
    }
    
    if (reservationId) {
      setHighlightedId(reservationId)
    }
    // El tercer useEffect se encargará de cargar los datos cuando cambien los filtros
  }, [])
  
  // Scroll a reserva destacada cuando se carga
  useEffect(() => {
    if (highlightedId && reservations.length > 0) {
      const timeout = setTimeout(() => {
        const element = reservationRefs.current[highlightedId]
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Auto-abrir detalles de la reserva
          const reservation = reservations.find(r => r.id === highlightedId)
          if (reservation) {
            setSelectedReservation(reservation)
          }
          // Quitar highlight después de 3 segundos
          setTimeout(() => setHighlightedId(null), 3000)
        }
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [highlightedId, reservations])

  // Sync search input with pending filters
  useEffect(() => {
    setPendingFilters(prev => ({ ...prev, search: searchInput }))
  }, [searchInput])

  // React Query se encarga automáticamente del fetch cuando cambian los filtros
  // Solo resetear la página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Aplicar filtros pendientes
  const applyFilters = () => {
    setFilters({ ...pendingFilters })
  }

  // Limpiar filtros
  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'ALL',
      dateRange: 'all'
    }
    setFilters(clearedFilters)
    setPendingFilters(clearedFilters)
    setSearchInput('')
  }

  // Aplicar filtros desde las tarjetas
  const applyQuickFilter = (filterType) => {
    const newFilters = { ...filters }
    
    switch(filterType) {
      case 'active':
        newFilters.dateRange = 'current'
        newFilters.status = 'CONFIRMED'
        break
      case 'checkins':
        newFilters.dateRange = 'today'
        newFilters.status = 'ALL'
        break
      case 'checkouts':
        newFilters.dateRange = 'checkouts_today'
        newFilters.status = 'ALL'
        break
      case 'pending':
        newFilters.status = 'PENDING_PAYMENT'
        newFilters.dateRange = 'all'
        break
      default:
        break
    }
    
    setFilters(newFilters)
    setPendingFilters(newFilters)
  }

  const updateReservationStatus = (reservationId, newStatus) => {
    updateStatusMutation.mutate({ reservationId, newStatus })
  }

  // Las stats ahora vienen del servidor

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas e Ingresos</h1>
        <p className="text-gray-600">Administra todas las reservas del hotel y sus ingresos</p>
      </div>

      {/* Stats Cards - Clickeables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => applyQuickFilter('active')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Huéspedes Activos</p>
                <p className="text-2xl font-bold text-purple-600">{globalStats.activeReservations}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Click para filtrar</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => applyQuickFilter('checkins')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-ins Hoy</p>
                <p className="text-2xl font-bold text-green-600">{globalStats.checkInsToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Click para filtrar</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => applyQuickFilter('checkouts')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-outs Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{globalStats.checkOutsToday}</p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Click para filtrar</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => applyQuickFilter('pending')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{globalStats.pendingPayments}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Click para filtrar</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Reservas</p>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{globalStats.totalReservations}</p>
              <p className="text-xs text-gray-500 mt-1">
                {filters.search || filters.status !== 'ALL' || filters.dateRange !== 'all'
                  ? `con filtros aplicados`
                  : 'En toda la base de datos'}
              </p>
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
          <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nombre, email, habitación..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={pendingFilters.status} onValueChange={(value) => setPendingFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los estados</SelectItem>
                      <SelectItem value="PENDING_PAYMENT">Pendiente de Pago</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                      <SelectItem value="CANCELLED">Cancelada</SelectItem>
                      <SelectItem value="COMPLETED">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateRange">Período</Label>
                  <Select value={pendingFilters.dateRange} onValueChange={(value) => setPendingFilters(prev => ({ ...prev, dateRange: value }))}>
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
          {pendingFilters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="customDateFrom">Check-in desde</Label>
                <Input
                  id="customDateFrom"
                  type="date"
                  value={pendingFilters.customDateFrom}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, customDateFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="customDateTo">Check-in hasta</Label>
                <Input
                  id="customDateTo"
                  type="date"
                  value={pendingFilters.customDateTo}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, customDateTo: e.target.value }))}
                />
              </div>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex gap-2 justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
            >
              Limpiar
            </Button>
            <Button
              type="button"
              onClick={applyFilters}
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Reservas ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
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
                  <TableHead>Pagado</TableHead>
                  <TableHead>Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow 
                    key={reservation.id}
                    ref={(el) => { if (el) reservationRefs.current[reservation.id] = el }}
                    className={highlightedId === reservation.id ? 'bg-blue-50 animate-pulse' : ''}
                  >
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
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(reservation.paidAmount)}
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
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalles de la Reserva</DialogTitle>
                            </DialogHeader>
                            {selectedReservation && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Información del Huésped</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                        <span className="break-words">{selectedReservation.user.name}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                        <span className="break-all">{selectedReservation.user.email}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                        {selectedReservation.guests} huésped{selectedReservation.guests > 1 ? 'es' : ''}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Información de la Habitación</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                        Habitación #{selectedReservation.room.number}
                                      </div>
                                      <div>{selectedReservation.room.roomType.name}</div>
                                      <div>Piso {selectedReservation.room.floor}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Fechas y Pagos</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <div>Check-in: {formatDate(selectedReservation.checkIn)}</div>
                                      <div>Check-out: {formatDate(selectedReservation.checkOut)}</div>
                                      <div>Reservado: {formatDateTime(selectedReservation.createdAt)}</div>
                                    </div>
                                    <div>
                                      <div>Total: {formatCurrency(selectedReservation.totalAmount)}</div>
                                      <div className="text-green-600 font-semibold">Pagado: {formatCurrency(selectedReservation.paidAmount)}</div>
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

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="border-l-4" style={{ borderLeftColor: statusConfig[reservation.status].variant === 'success' ? '#10b981' : statusConfig[reservation.status].variant === 'warning' ? '#f59e0b' : statusConfig[reservation.status].variant === 'destructive' ? '#ef4444' : '#6b7280' }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="font-semibold truncate">{reservation.user.name}</h3>
                      <p className="text-xs text-gray-500 break-all">{reservation.user.email}</p>
                    </div>
                    <Badge variant={statusConfig[reservation.status].variant} className="ml-2 flex-shrink-0">
                      {statusConfig[reservation.status].label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Habitación:</span>
                      <span className="font-medium">#{reservation.room.number} - {reservation.room.roomType.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span>{formatDate(reservation.checkIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span>{formatDate(reservation.checkOut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold">{formatCurrency(reservation.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pagado:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(reservation.paidAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Select 
                      value={reservation.status} 
                      onValueChange={(value) => updateReservationStatus(reservation.id, value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING_PAYMENT">Pendiente</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                        <SelectItem value="COMPLETED">Completada</SelectItem>
                        <SelectItem value="CANCELLED">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    
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
                      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalles de la Reserva</DialogTitle>
                        </DialogHeader>
                        {selectedReservation && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Información del Huésped</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                    <span className="break-words">{selectedReservation.user.name}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                    <span className="break-all">{selectedReservation.user.email}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                    {selectedReservation.guests} huésped{selectedReservation.guests > 1 ? 'es' : ''}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Información de la Habitación</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                    Habitación #{selectedReservation.room.number}
                                  </div>
                                  <div>{selectedReservation.room.roomType.name}</div>
                                  <div>Piso {selectedReservation.room.floor}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Fechas y Pagos</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div>Check-in: {formatDate(selectedReservation.checkIn)}</div>
                                  <div>Check-out: {formatDate(selectedReservation.checkOut)}</div>
                                  <div>Reservado: {formatDateTime(selectedReservation.createdAt)}</div>
                                </div>
                                <div>
                                  <div>Total: {formatCurrency(selectedReservation.totalAmount)}</div>
                                  <div className="text-green-600 font-semibold">Pagado: {formatCurrency(selectedReservation.paidAmount)}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t">
                              <Label htmlFor="status-select-mobile">Cambiar Estado</Label>
                              <Select 
                                value={selectedReservation.status} 
                                onValueChange={(value) => {
                                  updateReservationStatus(selectedReservation.id, value)
                                }}
                              >
                                <SelectTrigger id="status-select-mobile" className="w-full mt-2">
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
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || isLoading}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {reservations.length === 0 && !isLoading && (
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

export default function AdminReservasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <AdminReservasContent />
    </Suspense>
  )
}
