'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BookingWizard } from '@/components/ui/booking-wizard'
import { RoomDetailCompact } from '@/components/ui/room-detail-compact'
import { RoomFilters } from '@/components/ui/room-filters'
import { RoomComparison } from '@/components/ui/room-comparison'
import { useToast } from '@/hooks/use-toast'
import { 
  Calendar, 
  Users, 
  Search, 
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Clock,
  ArrowRight,
  ArrowLeft,
  GitCompare
} from 'lucide-react'
import { formatCurrency, calculateDays } from '@/lib/utils'

function ReservarContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  
  const [searchData, setSearchData] = useState({
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '2'
  })
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [availableRooms, setAvailableRooms] = useState([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  
  // New features state
  const [filters, setFilters] = useState({
    maxPrice: '',
    minCapacity: 'all',
    roomType: 'all',
    bedType: 'all',
    sortBy: 'relevance'
  })
  const [comparisonRooms, setComparisonRooms] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [preselectedRoomId, setPreselectedRoomId] = useState(searchParams.get('roomId') || null)

  // Load available room types from API
  useEffect(() => {
    fetchRoomTypes()
  }, [])

  // Pre-select room if roomId is in URL
  const hasPreselected = useRef(false)
  const hasSearchedForPreselected = useRef(false)
  
  useEffect(() => {
    // Only proceed if user is authenticated and rooms are loaded
    if (status !== 'authenticated' || !availableRooms.length) return
    
    // Only run once
    if (preselectedRoomId && !hasPreselected.current) {
      hasPreselected.current = true
      
      // If dates are provided, search for availability first to get correct room data
      if (searchData.checkIn && searchData.checkOut && !hasSearchedForPreselected.current) {
        hasSearchedForPreselected.current = true
        handleSearch(null, true)
      } else {
        // No dates, just select from availableRooms
        const room = availableRooms.find(r => r.id === preselectedRoomId || r.id === parseInt(preselectedRoomId))
        if (room) {
          setSelectedRoom(room)
          setCurrentStep(1)
        }
      }
    }
  }, [preselectedRoomId, availableRooms, status])
  
  // After search completes, select the room if coming from calendar
  useEffect(() => {
    if (preselectedRoomId && searchResults.length > 0 && !selectedRoom && hasSearchedForPreselected.current) {
      const room = searchResults.find(r => r.id === preselectedRoomId || r.id === parseInt(preselectedRoomId))
      if (room) {
        setSelectedRoom(room)
        setCurrentStep(3)
        setShowResults(true)
      }
    }
  }, [searchResults, preselectedRoomId, selectedRoom])

  // Redirect if not authenticated - using ref to prevent loops
  const isRedirecting = useRef(false)
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      // Check if we just came back from login
      const justLoggedIn = sessionStorage.getItem('justLoggedIn')
      
      if (justLoggedIn === 'true') {
        // Clear the flag after 3 seconds
        setTimeout(() => {
          sessionStorage.removeItem('justLoggedIn')
        }, 3000)
        return
      }
      
      // Only redirect once
      if (!isRedirecting.current) {
        isRedirecting.current = true
        const currentParams = window.location.search
        const returnUrl = encodeURIComponent(`/reservar${currentParams}`)
        window.location.href = `/login?returnUrl=${returnUrl}`
      }
    } else if (status === 'authenticated') {
      isRedirecting.current = false
      sessionStorage.removeItem('hasRedirectedToLogin')
      sessionStorage.removeItem('justLoggedIn')
      hasPreselected.current = false
    }
  }, [status])
  
  // Update URL with current state - disabled to prevent interference
  // useEffect(() => {
  //   const params = new URLSearchParams()
  //   if (searchData.checkIn) params.set('checkIn', searchData.checkIn)
  //   if (searchData.checkOut) params.set('checkOut', searchData.checkOut)
  //   if (searchData.guests) params.set('guests', searchData.guests)
  //   if (selectedRoom) params.set('roomId', selectedRoom.id)
    
  //   const newUrl = `${window.location.pathname}?${params.toString()}`
  //   window.history.replaceState({}, '', newUrl)
  // }, [searchData, selectedRoom])

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

  const handleSearch = async (e, autoSearch = false) => {
    if (e) e.preventDefault()
    
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
      const response = await fetch(
        `/api/rooms/available?checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&guests=${searchData.guests}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.roomTypes)
        setShowResults(true)
        if (!autoSearch) {
          setCurrentStep(2)
        }
        
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
    setCurrentStep(3)
  }
  
  // Filter and sort rooms
  const applyFiltersAndSort = (rooms) => {
    let filtered = [...rooms]
    
    // Apply filters
    if (filters.maxPrice) {
      filtered = filtered.filter(room => room.price <= parseInt(filters.maxPrice))
    }
    
    if (filters.minCapacity !== 'all') {
      filtered = filtered.filter(room => room.maxGuests >= parseInt(filters.minCapacity))
    }
    
    if (filters.roomType !== 'all') {
      filtered = filtered.filter(room => room.roomType === filters.roomType)
    }
    
    if (filters.bedType !== 'all') {
      filtered = filtered.filter(room => room.bedType && room.bedType.includes(filters.bedType))
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'capacity-desc':
        filtered.sort((a, b) => b.maxGuests - a.maxGuests)
        break
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // relevance - keep original order
        break
    }
    
    return filtered
  }
  
  // Comparison functions
  const toggleComparison = (room) => {
    if (comparisonRooms.find(r => r.id === room.id)) {
      setComparisonRooms(comparisonRooms.filter(r => r.id !== room.id))
    } else if (comparisonRooms.length < 3) {
      setComparisonRooms([...comparisonRooms, room])
    } else {
      toast({
        title: 'Límite alcanzado',
        description: 'Solo puedes comparar hasta 3 habitaciones a la vez',
        variant: 'destructive',
      })
    }
  }
  
  const removeFromComparison = (roomId) => {
    setComparisonRooms(comparisonRooms.filter(r => r.id !== roomId))
  }
  
  const selectFromComparison = (room) => {
    handleRoomSelect(room)
    setShowComparison(false)
  }
  
  const clearFilters = () => {
    setFilters({
      maxPrice: '',
      minCapacity: 'all',
      roomType: 'all',
      bedType: 'all',
      sortBy: 'relevance'
    })
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

  // Don't render anything while redirecting
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  const days = searchData.checkIn && searchData.checkOut ? 
    calculateDays(searchData.checkIn, searchData.checkOut) : 0
  
  const filteredRooms = applyFiltersAndSort(showResults ? searchResults : [])

  return (
    <>
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
          
          {/* Booking Wizard */}
          <BookingWizard currentStep={currentStep} />

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

          {/* Comparison View */}
          {showComparison && comparisonRooms.length > 0 && (
            <div className="mb-8">
              <RoomComparison 
                rooms={comparisonRooms}
                onRemoveRoom={removeFromComparison}
                onSelectRoom={selectFromComparison}
              />
            </div>
          )}

          {/* Search Results */}
          {showResults && currentStep === 2 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Habitaciones Disponibles ({filteredRooms.length})
                </h2>
                {comparisonRooms.length > 0 && (
                  <Button
                    variant={showComparison ? "default" : "outline"}
                    onClick={() => setShowComparison(!showComparison)}
                  >
                    <GitCompare className="mr-2 h-4 w-4" />
                    Comparar ({comparisonRooms.length})
                  </Button>
                )}
              </div>
              
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Filters Sidebar */}
                  <div className="lg:col-span-1">
                    <RoomFilters 
                      filters={filters}
                      onFiltersChange={setFilters}
                      onClearFilters={clearFilters}
                    />
                  </div>
                  
                  {/* Rooms Grid */}
                  <div className="lg:col-span-3">
                    {filteredRooms.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay resultados
                          </h3>
                          <p className="text-gray-600">
                            No encontramos habitaciones que coincidan con tus filtros.
                            Intenta ajustar los criterios de búsqueda.
                          </p>
                          <Button onClick={clearFilters} variant="outline" className="mt-4">
                            Limpiar filtros
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredRooms.map((room) => (
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
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{room.description}</p>
                        
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
                                🛌️ {room.bedType}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="border-t pt-3 mb-3">
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
                        
                        {/* Comparison Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleComparison(room)
                          }}
                          disabled={comparisonRooms.length >= 3 && !comparisonRooms.find(r => r.id === room.id)}
                        >
                          <GitCompare className="h-4 w-4 mr-2" />
                          {comparisonRooms.find(r => r.id === room.id) ? 'Quitar de comparación' : 'Añadir a comparación'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Room Detail View - Step 3 */}
          {selectedRoom && currentStep === 3 && (
            <div className="space-y-8">
              {/* Compact Room Detail */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Habitación Seleccionada
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRoom(null)
                      setCurrentStep(2)
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cambiar habitación
                  </Button>
                </div>
                <RoomDetailCompact room={selectedRoom} />
              </div>
              
              {/* Booking Summary */}
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
                      <h4 className="font-semibold mb-3">Detalles de la Reserva</h4>
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
                          <span className="font-medium">{days}</span>
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
                      
                      <div className="mt-6 space-y-3">
                        <Button 
                          onClick={handleBooking}
                          className="w-full"
                          size="lg"
                          disabled={isBooking}
                        >
                          {isBooking ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              Confirmar Reserva
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                        
                        <p className="text-xs text-gray-500 text-center">
                          Al confirmar, aceptas nuestros términos y condiciones
                        </p>
                      </div>
                      
                      {/* Cancellation Policy */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Política de Cancelación</h5>
                        <p className="text-xs text-gray-600">
                          Cancelación gratuita hasta 48 horas antes del check-in.
                          Después de este plazo, se cobrará la primera noche.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}

export default function ReservarPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }>
        <ReservarContent />
      </Suspense>
    </div>
  )
}
