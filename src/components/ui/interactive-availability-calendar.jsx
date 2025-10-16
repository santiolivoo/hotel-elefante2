'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { useToast } from '@/hooks/use-toast'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function InteractiveAvailabilityCalendar({ roomId }) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [checkInDate, setCheckInDate] = useState(null)
  const [checkOutDate, setCheckOutDate] = useState(null)

  useEffect(() => {
    fetchAvailability()
  }, [currentDate, roomId])

  const fetchAvailability = async () => {
    try {
      setIsLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      
      const response = await fetch(
        `/api/rooms/${roomId}/availability?year=${year}&month=${month}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setAvailability(data.availability || {})
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format date in local timezone as YYYY-MM-DD
  const formatDateLocal = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    
    // Días vacíos al inicio
    const startDayOfWeek = firstDay.getDay()
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }
    
    // Días del mes
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const dateStr = formatDateLocal(date)
      days.push({
        day,
        date,
        dateStr,
        isToday: isToday(date),
        isPast: isPast(date),
        availability: availability[dateStr]
      })
    }
    
    return days
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDayClick = (dayInfo) => {
    if (!dayInfo || dayInfo.isPast) return
    
    // Si no hay disponibilidad o no está disponible, no permitir selección
    if (!dayInfo.availability || !dayInfo.availability.available) {
      toast({
        title: 'Fecha no disponible',
        description: 'Esta fecha no tiene habitaciones disponibles',
        variant: 'destructive',
      })
      return
    }

    // Si no hay check-in seleccionado, establecer check-in
    if (!checkInDate) {
      setCheckInDate(dayInfo.dateStr)
      return
    }

    // Si ya hay check-in pero no check-out
    if (checkInDate && !checkOutDate) {
      const checkIn = new Date(checkInDate)
      const selectedDate = new Date(dayInfo.dateStr)
      
      // Si la fecha seleccionada es antes del check-in, reiniciar selección
      if (selectedDate <= checkIn) {
        setCheckInDate(dayInfo.dateStr)
        setCheckOutDate(null)
        return
      }
      
      // Establecer check-out
      setCheckOutDate(dayInfo.dateStr)
      return
    }

    // Si ambos están seleccionados, reiniciar selección
    if (checkInDate && checkOutDate) {
      setCheckInDate(dayInfo.dateStr)
      setCheckOutDate(null)
    }
  }

  const handleProceedToBooking = () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        title: 'Fechas incompletas',
        description: 'Por favor selecciona fecha de check-in y check-out',
        variant: 'destructive',
      })
      return
    }

    // Redirigir a la página de reserva con los parámetros
    router.push(`/reservar?roomId=${roomId}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=2`)
  }

  const handleClearDates = () => {
    setCheckInDate(null)
    setCheckOutDate(null)
  }

  const getDayClassName = (dayInfo) => {
    if (!dayInfo) return 'invisible'
    
    const baseClasses = 'aspect-square flex flex-col items-center justify-center rounded-lg p-2 text-sm relative transition-all'
    
    // Verificar si está en el rango seleccionado
    const isCheckIn = checkInDate === dayInfo.dateStr
    const isCheckOut = checkOutDate === dayInfo.dateStr
    const isInRange = checkInDate && checkOutDate && 
      dayInfo.dateStr > checkInDate && dayInfo.dateStr < checkOutDate

    if (dayInfo.isPast) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`
    }
    
    if (isCheckIn) {
      return `${baseClasses} bg-primary text-white font-bold cursor-pointer border-2 border-primary ring-2 ring-primary/50`
    }
    
    if (isCheckOut) {
      return `${baseClasses} bg-primary text-white font-bold cursor-pointer border-2 border-primary ring-2 ring-primary/50`
    }
    
    if (isInRange) {
      return `${baseClasses} bg-primary/20 text-primary font-medium cursor-pointer border-2 border-primary/30`
    }
    
    if (!dayInfo.availability) {
      return `${baseClasses} bg-gray-50 text-gray-600 cursor-pointer hover:bg-gray-100`
    }
    
    if (dayInfo.availability.available) {
      return `${baseClasses} bg-green-100 text-green-800 font-medium hover:bg-green-200 cursor-pointer border-2 border-green-300`
    } else {
      return `${baseClasses} bg-red-100 text-red-800 font-medium cursor-not-allowed border-2 border-red-300`
    }
  }

  const days = getDaysInMonth()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Selecciona tus fechas - {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Fechas seleccionadas */}
            {(checkInDate || checkOutDate) && (
              <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-medium text-gray-700">
                      {checkInDate && (
                        <span>
                          <strong>Check-in:</strong> {(() => {
                            const [year, month, day] = checkInDate.split('-')
                            const date = new Date(year, month - 1, day)
                            return date.toLocaleDateString('es-AR', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          })()}
                        </span>
                      )}
                    </div>
                    {checkOutDate && (
                      <div className="text-sm font-medium text-gray-700">
                        <strong>Check-out:</strong> {(() => {
                          const [year, month, day] = checkOutDate.split('-')
                          const date = new Date(year, month - 1, day)
                          return date.toLocaleDateString('es-AR', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleClearDates}>
                      Limpiar
                    </Button>
                    {checkInDate && checkOutDate && (
                      <Button size="sm" onClick={handleProceedToBooking}>
                        Continuar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAYS.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 p-2"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((dayInfo, index) => (
                <div
                  key={index}
                  className={getDayClassName(dayInfo)}
                  onClick={() => handleDayClick(dayInfo)}
                  title={dayInfo?.availability ? 
                    `${dayInfo.availability.availableRooms}/${dayInfo.availability.totalRooms} habitaciones disponibles` 
                    : dayInfo && !dayInfo.isPast ? 'Haz clic para seleccionar' : ''}
                >
                  {dayInfo && (
                    <>
                      <span className={dayInfo.isToday ? 'font-bold' : ''}>
                        {dayInfo.day}
                      </span>
                      {dayInfo.availability && !dayInfo.isPast && (
                        <span className="text-[10px] mt-0.5">
                          {dayInfo.availability.availableRooms}/{dayInfo.availability.totalRooms}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* Instrucciones */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Instrucciones:</strong> Haz clic en una fecha para seleccionar tu check-in, 
                luego haz clic en otra fecha posterior para el check-out.
              </p>
            </div>
            
            {/* Leyenda */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span className="text-gray-600">Seleccionada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-gray-600">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                <span className="text-gray-600">No disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-gray-600">Fecha pasada</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
