'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InteractiveAvailabilityCalendar } from '@/components/ui/interactive-availability-calendar'
import { 
  Users, 
  ArrowLeft,
  Star,
  Calendar,
  Loader2,
  Bed,
  Maximize
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'


export default function HabitacionDetailPage() {
  const params = useParams()
  const [room, setRoom] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    fetchRoom()
  }, [params.id])

  const fetchRoom = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/rooms/${params.id}`)
      const data = await response.json()
      
      if (response.ok && data.room) {
        setRoom(data.room)
      }
    } catch (error) {
      console.error('Error loading room:', error)
    } finally {
      setIsLoading(false)
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Habitación no encontrada
              </h1>
              <Link href="/habitaciones">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a habitaciones
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/habitaciones" className="text-primary hover:text-primary/80 flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a habitaciones
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="mb-4">
                <img
                  src={room.images[selectedImage] || room.image}
                  alt={room.name}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg"
                />
              </div>
              {room.images && room.images.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
                  {room.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 sm:h-24 rounded-lg overflow-hidden transition-all ${
                        selectedImage === index ? 'ring-2 ring-primary' : 'hover:opacity-80'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${room.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room Info */}
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{room.roomType}</Badge>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {room.name}
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{room.rating}</span>
                    <span className="ml-1 text-sm text-gray-500">({room.reviews} reseñas)</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Hasta {room.maxGuests} huéspedes</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 text-sm sm:text-base">{room.description}</p>

                <div className="text-2xl sm:text-3xl font-bold text-primary mb-6">
                  {formatCurrency(room.price)}
                  <span className="text-base sm:text-lg font-normal text-gray-500">/noche</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <Link href={`/reservar?roomId=${room.id}`} className="flex-1">
                    <Button size="lg" className="w-full">
                      Reservar Ahora
                    </Button>
                  </Link>
                  <Button 
                    variant={showCalendar ? "default" : "outline"} 
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {showCalendar ? 'Ocultar' : 'Ver'} Fechas
                  </Button>
                </div>
              </div>

              {/* Room Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles de la Habitación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {room.size && (
                      <div className="flex items-center">
                        <Maximize className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <span className="font-medium">Tamaño:</span>
                          <span className="ml-2 text-gray-600">{room.size}</span>
                        </div>
                      </div>
                    )}
                    {room.bedType && (
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <span className="font-medium">Tipo de cama:</span>
                          <span className="ml-2 text-gray-600">{room.bedType}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <div>
                        <span className="font-medium">Capacidad:</span>
                        <span className="ml-2 text-gray-600">Máximo {room.maxGuests} huéspedes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Calendar Section */}
          {showCalendar && (
            <div className="mt-8">
              <InteractiveAvailabilityCalendar roomId={room.id} />
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
