'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { 
  Building, 
  Search,
  Filter,
  Bed,
  Users,
  Loader2,
  Calendar
} from 'lucide-react'
import { AvailabilityCalendar } from '@/components/ui/availability-calendar'

const statusConfig = {
  'AVAILABLE': { label: 'Disponible', variant: 'success', color: 'bg-green-100 text-green-800' },
  'OCCUPIED': { label: 'Ocupada', variant: 'destructive', color: 'bg-red-100 text-red-800' },
  'MAINTENANCE': { label: 'Mantenimiento', variant: 'warning', color: 'bg-yellow-100 text-yellow-800' }
}

export default function OperadorHabitacionesPage() {
  const [rooms, setRooms] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    roomType: 'all',
    floor: 'all'
  })
  
  const [showCalendarForRoom, setShowCalendarForRoom] = useState(null)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
    // Auto-sincronizar al cargar
    syncRoomStatus()
  }, [])
  
  // Auto-sincronizar cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      syncRoomStatus()
    }, 5 * 60 * 1000) // 5 minutos
    
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      // Cargar tipos de habitación
      const roomTypesResponse = await fetch('/api/rooms')
      const roomTypesData = await roomTypesResponse.json()
      
      // Cargar habitaciones
      const roomsResponse = await fetch('/api/admin/rooms')
      const roomsData = await roomsResponse.json()
      
      if (roomTypesResponse.ok) {
        const types = roomTypesData.roomTypes.map(type => ({
          id: type.id,
          name: type.name,
          basePrice: type.price,
          maxGuests: type.maxGuests
        }))
        setRoomTypes(types)
      }
      
      if (roomsResponse.ok) {
        const mappedRooms = roomsData.rooms.map(room => ({
          id: room.id,
          number: room.number,
          floor: room.floor,
          roomTypeId: room.roomTypeId,
          roomType: room.roomType.name,
          status: room.status,
          description: room.description || ''
        }))
        setRooms(mappedRooms)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las habitaciones',
          variant: 'destructive',
        })
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las habitaciones',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  const syncRoomStatus = async () => {
    try {
      await fetch('/api/admin/rooms/sync-status', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error syncing room status:', error)
    }
  }

  const handleChangeStatus = async (roomId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        toast({
          title: 'Estado actualizado',
          description: `Estado cambiado a ${statusConfig[newStatus].label}`,
        })
        await syncRoomStatus()
        fetchData()
      } else {
        const data = await response.json()
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el estado',
        variant: 'destructive',
      })
    }
  }

  const filteredRooms = rooms.filter(room => {
    return (
      (!filters.search || room.number.includes(filters.search) || room.description.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.status === 'all' || room.status === filters.status) &&
      (filters.roomType === 'all' || room.roomType === filters.roomType) &&
      (filters.floor === 'all' || room.floor.toString() === filters.floor)
    )
  })

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
        <h1 className="text-3xl font-bold text-gray-900">Habitaciones</h1>
        <p className="text-gray-600">Consulta el estado de las habitaciones del hotel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Habitaciones</p>
                <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              </div>
              <Building className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter(r => r.status === 'AVAILABLE').length}
                </p>
              </div>
              <Bed className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ocupadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {rooms.filter(r => r.status === 'OCCUPIED').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mantenimiento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {rooms.filter(r => r.status === 'MAINTENANCE').length}
                </p>
              </div>
              <Loader2 className="h-8 w-8 text-yellow-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Número, descripción..."
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="AVAILABLE">Disponible</SelectItem>
                  <SelectItem value="OCCUPIED">Ocupada</SelectItem>
                  <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="roomType">Tipo</Label>
              <Select value={filters.roomType} onValueChange={(value) => setFilters(prev => ({ ...prev, roomType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {roomTypes.map(type => (
                    <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="floor">Piso</Label>
              <Select value={filters.floor} onValueChange={(value) => setFilters(prev => ({ ...prev, floor: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pisos</SelectItem>
                  {Array.from(new Set(rooms.map(r => r.floor))).sort().map(floor => (
                    <SelectItem key={floor} value={floor.toString()}>{floor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Habitaciones ({filteredRooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Piso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Calendario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">#{room.number}</TableCell>
                    <TableCell>{room.roomType}</TableCell>
                    <TableCell>Piso {room.floor}</TableCell>
                    <TableCell>
                      <Select 
                        value={room.status} 
                        onValueChange={(value) => handleChangeStatus(room.id, value)}
                      >
                        <SelectTrigger className="w-[160px]">
                          <Badge variant={statusConfig[room.status].variant} className="w-full justify-center">
                            {statusConfig[room.status].label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-600"></div>
                              <span>Disponible</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="OCCUPIED">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-600"></div>
                              <span>Ocupada</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="MAINTENANCE">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                              <span>Mantenimiento</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowCalendarForRoom(showCalendarForRoom === room.id ? null : room.id)}
                        title="Ver calendario de disponibilidad"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredRooms.length === 0 && (
            <div className="text-center py-8">
              <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron habitaciones
              </h3>
              <p className="text-gray-600">
                No hay habitaciones que coincidan con los filtros seleccionados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Section */}
      {showCalendarForRoom && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Calendario de Disponibilidad - Habitación #{rooms.find(r => r.id === showCalendarForRoom)?.number}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCalendarForRoom(null)}
              >
                Cerrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AvailabilityCalendar roomId={showCalendarForRoom} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
