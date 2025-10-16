'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const cardRef = useRef(null)
  
  // Configuración de swipe - mínimo 50px para considerar un swipe
  const minSwipeDistance = 50

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

  // Handlers para swipe en móvil
  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
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
            <div className="max-w-2xl mx-auto px-4 sm:px-12 lg:px-0">
              {/* Habitación actual con soporte para swipe */}
              <div
                ref={cardRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="touch-pan-y select-none"
              >
                <Card className={`overflow-hidden shadow-xl transition-all duration-500 ease-in-out ${
                  isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={rooms[currentIndex].image}
                      alt={rooms[currentIndex].name}
                      className={`w-full h-64 sm:h-80 object-cover transition-transform duration-700 ease-out ${
                        isTransitioning ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    <Badge className={`absolute top-4 left-4 bg-primary text-white transition-all duration-300 ${
                      isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}>
                      {currentIndex + 1} / {rooms.length}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4 sm:p-8">
                    <h3 className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 transition-all duration-300 delay-100 ${
                      isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                    }`}>
                      {rooms[currentIndex].name}
                    </h3>
                    <p className={`text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed transition-all duration-300 delay-150 ${
                      isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                    }`}>
                      {rooms[currentIndex].shortDescription || rooms[currentIndex].description}
                    </p>
                    
                    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b transition-all duration-300 delay-200 ${
                      isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                    }`}>
                      <div className="flex items-center text-gray-600 text-sm sm:text-base">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span>Hasta {rooms[currentIndex].maxGuests} huéspedes</span>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-2xl sm:text-3xl font-bold text-primary">
                          {formatCurrency(rooms[currentIndex].price)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">por noche</div>
                      </div>
                    </div>
                    
                    {(rooms[currentIndex].size || rooms[currentIndex].bedType) && (
                      <div className={`flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 transition-all duration-300 delay-250 ${
                        isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                      }`}>
                        {rooms[currentIndex].size && (
                          <div className="flex items-center text-gray-700 text-sm sm:text-base">
                            <Maximize className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                            <span className="font-medium">{rooms[currentIndex].size}</span>
                          </div>
                        )}
                        {rooms[currentIndex].bedType && (
                          <div className="flex items-center text-gray-700 text-sm sm:text-base">
                            <Bed className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                            <span className="font-medium">{rooms[currentIndex].bedType}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className={`p-4 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3 sm:gap-4 transition-all duration-300 delay-300 ${
                    isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}>
                    <Link href={`/habitaciones/${rooms[currentIndex].id}`} className="flex-1 w-full">
                      <Button variant="outline" size="lg" className="w-full">
                        Ver Detalles
                      </Button>
                    </Link>
                    <Link href={`/reservar?roomId=${rooms[currentIndex].id}`} className="flex-1 w-full">
                      <Button size="lg" className="w-full">
                        Reservar Ahora
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Botones de Navegación - Solo visible en desktop */}
            <div className="hidden sm:flex absolute top-1/3 -translate-y-1/2 left-0 right-0 justify-between px-2 pointer-events-none">
              <Button
                onClick={goToPrevious}
                size="icon"
                variant="outline"
                className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all pointer-events-auto"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={goToNext}
                size="icon"
                variant="outline"
                className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all pointer-events-auto"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Indicadores (Dots) */}
            <div className="flex justify-center gap-2 mt-6 sm:mt-8">
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

            {/* Indicador de swipe en móvil */}
            <div className="sm:hidden text-center mt-4 text-sm text-gray-500">
              Desliza para ver más habitaciones
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
