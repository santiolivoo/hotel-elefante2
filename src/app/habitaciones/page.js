'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Loader2, Bed, Maximize } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function HabitacionesPage() {
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      
      if (response.ok) {
        setRooms(data.roomTypes)
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestras Habitaciones
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras cómodas y elegantes habitaciones, cada una diseñada 
              para brindarte la mejor experiencia durante tu estadía.
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            /* Rooms Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-48 object-cover"
                  />
                  
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-4">{room.shortDescription || room.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Hasta {room.maxGuests} huéspedes</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(room.price)}
                      <span className="text-sm font-normal text-gray-500">/noche</span>
                    </div>
                  </div>
                  
                  {(room.size || room.bedType) && (
                    <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                      {room.size && (
                        <div className="flex items-center">
                          <Maximize className="h-4 w-4 mr-1 text-primary" />
                          <span>{room.size}</span>
                        </div>
                      )}
                      {room.bedType && (
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1 text-primary" />
                          <span>{room.bedType}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="p-6 pt-0 flex gap-2">
                  <Link href={`/habitaciones/${room.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Ver Detalles
                    </Button>
                  </Link>
                  <Link href={`/reservar?roomId=${room.id}`} className="flex-1">
                    <Button className="w-full" disabled={room.available === 0}>
                      {room.available > 0 ? 'Reservar' : 'No disponible'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
