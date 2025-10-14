'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Calendar, 
  Users, 
  Search, 
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Clock
} from 'lucide-react'
import { formatCurrency, calculateDays } from '@/lib/utils'

export default function ReservarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [searchData, setSearchData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2'
  })
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [availableRooms, setAvailableRooms] = useState([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)

  // Load available room types from API
  useEffect(() => {
    fetchRoomTypes()
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      
      if (response.ok) {
        setAvailableRooms(data.roomTypes)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las habitaciones',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error loading room types:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar las habitaciones',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingRooms(false)
    }
  }

  const handleSearchChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Función para formatear fecha correctamente (evita problema de timezone)
  const formatLocalDate = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchData.checkIn || !searchData.checkOut) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona las fechas de check-in y check-out',
        variant: 'destructive',
      })
      return
    }

    if (new Date(searchData.checkIn) >= new Date(searchData.checkOut)) {
      toast({
        title: 'Error',
        description: 'La fecha de check-out debe ser posterior al check-in',
        variant: 'destructive',
      })
      return
    }

    setIsSearching(true)
    
    try {
      // Buscar habitaciones disponibles para las fechas específicas
      const response = await fetch(
        `/api/rooms/available?checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&guests=${searchData.guests}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.roomTypes)
        setShowResults(true)
        
        if (data.roomTypes.length === 0) {
          toast({
            title: 'Sin disponibilidad',
            description: 'No hay habitaciones disponibles para las fechas seleccionadas',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las habitaciones disponibles',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al buscar disponibilidad',
        variant: 'destructive',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
  }

  const handleBooking = async () => {
    if (!selectedRoom) return

    setIsBooking(true)

    const days = calculateDays(searchData.checkIn, searchData.checkOut)
    const totalAmount = selectedRoom.price * days

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn: searchData.checkIn,
          checkOut: searchData.checkOut,
          guests: parseInt(searchData.guests),
          totalAmount
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Reserva creada',
          description: 'Tu reserva ha sido creada exitosamente',
        })
        router.push(`/mis-reservas`)
      } else {
        toast({
          title: 'Error en la reserva',
          description: data.message || 'No se pudo crear la reserva',
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
      setIsBooking(false)
    }
  }

  if (status === 'loading' || isLoadingRooms) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Cargando habitaciones disponibles...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const days = searchData.checkIn && searchData.checkOut ? 
    calculateDays(searchData.checkIn, searchData.checkOut) : 0

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Reservar Habitación
            </h1>
            <p className="text-lg text-gray-600">
              Encuentra y reserva la habitación perfecta para tu estadía
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-primary" />
                Buscar Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="checkIn">Check-in</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) => handleSearchChange('checkIn', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="checkOut">Check-out</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) => handleSearchChange('checkOut', e.target.value)}
                      min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="guests">Huéspedes</Label>
                    <Select value={searchData.guests} onValueChange={(value) => handleSearchChange('guests', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 huésped</SelectItem>
                        <SelectItem value="2">2 huéspedes</SelectItem>
                        <SelectItem value="3">3 huéspedes</SelectItem>
                        <SelectItem value="4">4 huéspedes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {days > 0 && (
                  <div className="text-sm text-gray-600 text-center">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Estadía de {days} {days === 1 ? 'noche' : 'noches'}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Search Results */}
          {showResults && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Habitaciones Disponibles
              </h2>
              
              {searchResults.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay habitaciones disponibles
                    </h3>
                    <p className="text-gray-600">
                      No encontramos habitaciones disponibles para las fechas seleccionadas.
                      Intenta con otras fechas o reduce el número de huéspedes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchResults.map((room) => (
                    <Card 
                      key={room.id} 
                      className={`cursor-pointer transition-all ${
                        selectedRoom?.id === room.id 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <div className="relative">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge variant="secondary">{room.roomType}</Badge>
                          <Badge variant="success">
                            {room.available} disponible{room.available > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        {selectedRoom?.id === room.id && (
                          <div className="absolute top-4 right-4">
                            <div className="bg-primary text-white rounded-full p-1">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{room.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            <span>Hasta {room.maxGuests} huéspedes</span>
                          </div>
                        </div>
                        
                        {(room.size || room.bedType) && (
                          <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
                            {room.size && (
                              <Badge variant="outline" className="text-xs">
                                📏 {room.size}
                              </Badge>
                            )}
                            {room.bedType && (
                              <Badge variant="outline" className="text-xs">
                                🛏️ {room.bedType}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-2xl font-bold text-primary">
                                {formatCurrency(room.price)}
                              </div>
                              <div className="text-xs text-gray-500">por noche</div>
                            </div>
                            {days > 0 && (
                              <div className="text-right">
                                <div className="text-lg font-semibold">
                                  {formatCurrency(room.price * days)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {days} {days === 1 ? 'noche' : 'noches'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Booking Summary */}
          {selectedRoom && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-primary" />
                  Resumen de Reserva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Detalles de la Habitación</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Habitación:</span>
                        <span className="font-medium">{selectedRoom.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span>{selectedRoom.roomType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Huéspedes:</span>
                        <span>{searchData.guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-in:</span>
                        <span>{formatLocalDate(searchData.checkIn)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-out:</span>
                        <span>{formatLocalDate(searchData.checkOut)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Noches:</span>
                        <span>{days}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Resumen de Precios</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{formatCurrency(selectedRoom.price)} x {days} {days === 1 ? 'noche' : 'noches'}</span>
                        <span>{formatCurrency(selectedRoom.price * days)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Impuestos y tasas</span>
                        <span>Incluidos</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(selectedRoom.price * days)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleBooking}
                      className="w-full mt-6"
                      size="lg"
                      disabled={isBooking}
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        'Confirmar Reserva'
                      )}
                    </Button>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Al confirmar, aceptas nuestros términos y condiciones
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
