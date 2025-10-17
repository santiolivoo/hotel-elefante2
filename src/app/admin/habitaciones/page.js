'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Bed,
  Users,
  Loader2,
  Calendar
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { AvailabilityCalendar } from '@/components/ui/availability-calendar'

const statusConfig = {
  'AVAILABLE': { label: 'Disponible', variant: 'success', color: 'bg-green-100 text-green-800' },
  'OCCUPIED': { label: 'Ocupada', variant: 'destructive', color: 'bg-red-100 text-red-800' },
  'MAINTENANCE': { label: 'Mantenimiento', variant: 'warning', color: 'bg-yellow-100 text-yellow-800' }
}

export default function AdminHabitacionesPage() {
  const [rooms, setRooms] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    status: 'all',
    roomType: 'all',
    floor: 'all'
  })
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    roomType: 'all',
    floor: 'all'
  })
  
  // Estados para ocupación manual
  const [occupyDialog, setOccupyDialog] = useState({
    open: false,
    roomId: null,
    roomNumber: '',
    roomTypePrice: 0
  })
  
  const [occupyForm, setOccupyForm] = useState({
    guestName: '',
    guestEmail: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: '',
    guests: 1,
    totalAmount: 0
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
      // Cargar tipos de habitación desde API
      const roomTypesResponse = await fetch('/api/rooms')
      const roomTypesData = await roomTypesResponse.json()
      
      // Cargar habitaciones desde API
      const roomsResponse = await fetch('/api/admin/rooms')
      const roomsData = await roomsResponse.json()
      
      if (roomTypesResponse.ok) {
        // Mapear tipos de habitación con estructura correcta
        const types = roomTypesData.roomTypes.map(type => ({
          id: type.id,
          name: type.name,
          basePrice: type.price,
          maxGuests: type.maxGuests
        }))
        setRoomTypes(types)
      }
      
      if (roomsResponse.ok) {
        // Mapear habitaciones con estructura correcta
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

  const handleCreateRoom = async (formData) => {
    try {
      if (editingRoom) {
        // Actualizar habitación existente
        const response = await fetch(`/api/admin/rooms/${editingRoom.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        
        if (response.ok) {
          toast({
            title: 'Habitación actualizada',
            description: 'La habitación ha sido actualizada exitosamente',
          })
          fetchData()
        } else {
          const data = await response.json()
          throw new Error(data.message)
        }
      } else {
        // Crear nueva habitación
        const response = await fetch('/api/admin/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        
        if (response.ok) {
          toast({
            title: 'Habitación creada',
            description: 'La habitación ha sido creada exitosamente',
          })
          fetchData()
        } else {
          const data = await response.json()
          throw new Error(data.message)
        }
      }
      
      setShowCreateDialog(false)
      setEditingRoom(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la habitación',
        variant: 'destructive',
      })
    }
  }

  const handleEditRoom = (room) => {
    setEditingRoom(room)
    setShowCreateDialog(true)
  }

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('¿Estás seguro de eliminar esta habitación?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast({
          title: 'Habitación eliminada',
          description: 'La habitación ha sido eliminada exitosamente',
        })
        fetchData()
      } else {
        const data = await response.json()
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la habitación',
        variant: 'destructive',
      })
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
    // Si se marca como OCCUPIED, abrir dialog de ocupación manual
    if (newStatus === 'OCCUPIED') {
      const room = rooms.find(r => r.id === roomId)
      const roomType = roomTypes.find(rt => rt.id === room.roomTypeId)
      
      setOccupyDialog({
        open: true,
        roomId: roomId,
        roomNumber: room.number,
        roomTypePrice: roomType?.basePrice || 0
      })
      
      // Calcular monto sugerido (1 noche)
      setOccupyForm(prev => ({
        ...prev,
        totalAmount: roomType?.basePrice || 0
      }))
      
      return
    }
    
    // Para otros status, cambiar directamente
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
        // Auto-sincronizar después de cambiar status
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
  
  const handleOccupyRoom = async () => {
    // Validar formulario
    if (!occupyForm.guestName || !occupyForm.guestEmail || !occupyForm.checkOut) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive'
      })
      return
    }
    
    try {
      const response = await fetch(`/api/admin/rooms/${occupyDialog.roomId}/manual-reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(occupyForm)
      })
      
      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Habitación ocupada',
          description: `Reserva manual creada para ${occupyForm.guestName}`,
        })
        
        // Cerrar dialog y limpiar formulario
        setOccupyDialog({ open: false, roomId: null, roomNumber: '', roomTypePrice: 0 })
        setOccupyForm({
          guestName: '',
          guestEmail: '',
          checkIn: new Date().toISOString().split('T')[0],
          checkOut: '',
          guests: 1,
          totalAmount: 0
        })
        
        fetchData()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Error al ocupar habitación')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }
  

  // Aplicar filtros
  const applyFilters = () => {
    setFilters({ ...pendingFilters })
  }

  // Limpiar filtros
  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'all',
      roomType: 'all',
      floor: 'all'
    }
    setFilters(clearedFilters)
    setPendingFilters(clearedFilters)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Habitaciones</h1>
          <p className="text-gray-600">Administra las habitaciones del hotel</p>
        </div>
        <Dialog 
          open={showCreateDialog} 
          onOpenChange={(open) => {
            setShowCreateDialog(open)
            if (!open) setEditingRoom(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Habitación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? 'Editar Habitación' : 'Crear Nueva Habitación'}
              </DialogTitle>
            </DialogHeader>
            <RoomForm 
              roomTypes={roomTypes}
              editingRoom={editingRoom}
              onSubmit={handleCreateRoom}
              onCancel={() => {
                setShowCreateDialog(false)
                setEditingRoom(null)
              }}
            />
          </DialogContent>
        </Dialog>
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
              <Building className="h-8 w-8 text-yellow-600" />
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
                  value={pendingFilters.search}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Estado</Label>
              <Select value={pendingFilters.status} onValueChange={(value) => setPendingFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="AVAILABLE">Disponible</SelectItem>
                  <SelectItem value="OCCUPIED">Ocupada</SelectItem>
                  <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={pendingFilters.roomType} onValueChange={(value) => setPendingFilters(prev => ({ ...prev, roomType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
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
              <Label>Piso</Label>
              <Select value={pendingFilters.floor} onValueChange={(value) => setPendingFilters(prev => ({ ...prev, floor: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los pisos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pisos</SelectItem>
                  <SelectItem value="1">1er Piso</SelectItem>
                  <SelectItem value="2">2do Piso</SelectItem>
                  <SelectItem value="3">3er Piso</SelectItem>
                  <SelectItem value="4">4to Piso</SelectItem>
                  <SelectItem value="5">5to Piso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
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
        </CardContent>
      </Card>
      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Habitaciones ({filteredRooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Piso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center w-[200px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">#{room.number}</TableCell>
                  <TableCell>{room.roomType}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>
                    <Select 
                      value={room.status} 
                      onValueChange={(value) => handleChangeStatus(room.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Disponible</SelectItem>
                        <SelectItem value="OCCUPIED">Ocupada</SelectItem>
                        <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Acciones centradas */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowCalendarForRoom(showCalendarForRoom === room.id ? null : room.id)}
                        title="Ver calendario de disponibilidad"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditRoom(room)}
                        title="Editar habitación"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteRoom(room.id)}
                        title="Eliminar habitación"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      {/* Dialog de Ocupación Manual */}
      <Dialog open={occupyDialog.open} onOpenChange={(open) => setOccupyDialog({ ...occupyDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ocupar Habitación #{occupyDialog.roomNumber}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="guestName">Nombre del Huésped *</Label>
              <Input
                id="guestName"
                value={occupyForm.guestName}
                onChange={(e) => setOccupyForm({ ...occupyForm, guestName: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <Label htmlFor="guestEmail">Email *</Label>
              <Input
                id="guestEmail"
                type="email"
                value={occupyForm.guestEmail}
                onChange={(e) => setOccupyForm({ ...occupyForm, guestEmail: e.target.value })}
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={occupyForm.checkIn}
                  onChange={(e) => setOccupyForm({ ...occupyForm, checkIn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out *</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={occupyForm.checkOut}
                  onChange={(e) => setOccupyForm({ ...occupyForm, checkOut: e.target.value })}
                  min={occupyForm.checkIn}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guests">Huéspedes</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  value={occupyForm.guests}
                  onChange={(e) => setOccupyForm({ ...occupyForm, guests: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="totalAmount">Monto Total</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  value={occupyForm.totalAmount}
                  onChange={(e) => setOccupyForm({ ...occupyForm, totalAmount: parseFloat(e.target.value) })}
                  placeholder="150000"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> Se creará una reserva manual y la habitación se marcará como ocupada.
                El monto sugerido es el precio base por noche del tipo de habitación.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setOccupyDialog({ open: false, roomId: null, roomNumber: '', roomTypePrice: 0 })
                  setOccupyForm({
                    guestName: '',
                    guestEmail: '',
                    checkIn: new Date().toISOString().split('T')[0],
                    checkOut: '',
                    guests: 1,
                    totalAmount: 0
                  })
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleOccupyRoom}>
                Confirmar Ocupación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
    </div>
  )
}

function RoomForm({ roomTypes, editingRoom, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    number: editingRoom?.number || '',
    floor: editingRoom?.floor?.toString() || '',
    roomTypeId: editingRoom?.roomTypeId?.toString() || '',
    status: editingRoom?.status || 'AVAILABLE'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="number">Número de Habitación</Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="floor">Piso</Label>
          <Select value={formData.floor} onValueChange={(value) => setFormData(prev => ({ ...prev, floor: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar piso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1er Piso</SelectItem>
              <SelectItem value="2">2do Piso</SelectItem>
              <SelectItem value="3">3er Piso</SelectItem>
              <SelectItem value="4">4to Piso</SelectItem>
              <SelectItem value="5">5to Piso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="roomTypeId">Tipo de Habitación</Label>
        <Select value={formData.roomTypeId} onValueChange={(value) => setFormData(prev => ({ ...prev, roomTypeId: value }))} required>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {roomTypes.map(type => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name} - {formatCurrency(type.basePrice)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> La descripción, precio base y capacidad máxima se heredan del tipo de habitación seleccionado.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingRoom ? 'Actualizar' : 'Crear Habitación'}
        </Button>
      </div>
    </form>
  )
}
