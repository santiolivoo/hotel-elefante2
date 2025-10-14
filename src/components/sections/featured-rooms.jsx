'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Loader2, Bed, Maximize, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function FeaturedRooms() {
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    // Auto-play: cambiar habitación cada 5 segundos
    if (rooms.length > 0 && !isTransitioning) {
      const interval = setInterval(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % rooms.length)
          setIsTransitioning(false)
        }, 300)
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [rooms.length, isTransitioning])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      
      if (response.ok) {
        // Mostrar TODAS las habitaciones en el carrusel
        setRooms(data.roomTypes)
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const goToPrevious = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + rooms.length) % rooms.length)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const goToNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rooms.length)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(index)
        setIsTransitioning(false)
      }, 300)
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestras Habitaciones
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras cómodas y elegantes habitaciones, diseñadas para brindarte 
            la mejor experiencia durante tu estadía en San Lorenzo.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : rooms.length > 0 ? (
          <div className="relative">
            {/* Carrusel Container */}
            <div className="max-w-2xl mx-auto">
              {/* Habitación actual */}
              <Card className={`overflow-hidden shadow-xl transition-all duration-500 ease-in-out ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}>
                <div className="relative overflow-hidden">
                  <img
                    src={rooms[currentIndex].image}
                    alt={rooms[currentIndex].name}
                    className={`w-full h-80 object-cover transition-transform duration-700 ease-out ${
                      isTransitioning ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  <Badge className={`absolute top-4 left-4 bg-primary text-white transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                  }`}>
                    {currentIndex + 1} / {rooms.length}
                  </Badge>
                </div>
                
                <CardContent className="p-8">
                  <h3 className={`text-2xl font-bold mb-3 transition-all duration-300 delay-100 ${
                    isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}>
                    {rooms[currentIndex].name}
                  </h3>
                  <p className={`text-gray-600 mb-6 text-base leading-relaxed transition-all duration-300 delay-150 ${
                    isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}>
                    {rooms[currentIndex].shortDescription || rooms[currentIndex].description}
                  </p>
                  
                  <div className={`flex items-center justify-between mb-6 pb-6 border-b transition-all duration-300 delay-200 ${
                    isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-2" />
                      <span>Hasta {rooms[currentIndex].maxGuests} huéspedes</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(rooms[currentIndex].price)}
                      </div>
                      <div className="text-sm text-gray-500">por noche</div>
                    </div>
                  </div>
                  
                  {(rooms[currentIndex].size || rooms[currentIndex].bedType) && (
                    <div className={`flex flex-wrap gap-4 mb-6 transition-all duration-300 delay-250 ${
                      isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                    }`}>
                      {rooms[currentIndex].size && (
                        <div className="flex items-center text-gray-700">
                          <Maximize className="h-5 w-5 mr-2 text-primary" />
                          <span className="font-medium">{rooms[currentIndex].size}</span>
                        </div>
                      )}
                      {rooms[currentIndex].bedType && (
                        <div className="flex items-center text-gray-700">
                          <Bed className="h-5 w-5 mr-2 text-primary" />
                          <span className="font-medium">{rooms[currentIndex].bedType}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className={`p-8 pt-0 flex gap-4 transition-all duration-300 delay-300 ${
                  isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`}>
                  <Link href={`/habitaciones/${rooms[currentIndex].id}`} className="flex-1">
                    <Button variant="outline" size="lg" className="w-full">
                      Ver Detalles
                    </Button>
                  </Link>
                  <Link href="/reservar" className="flex-1">
                    <Button size="lg" className="w-full">
                      Reservar Ahora
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Botones de Navegación */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4">
              <Button
                onClick={goToPrevious}
                size="icon"
                variant="outline"
                className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={goToNext}
                size="icon"
                variant="outline"
                className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Indicadores (Dots) */}
            <div className="flex justify-center gap-2 mt-8">
              {rooms.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir a habitación ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay habitaciones disponibles</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/habitaciones">
            <Button size="lg" variant="outline">
              Ver Todas las Habitaciones
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
