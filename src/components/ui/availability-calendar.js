'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function AvailabilityCalendar({ roomId }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState({})
  const [isLoading, setIsLoading] = useState(false)

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
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        day,
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

  const getDayClassName = (dayInfo) => {
    if (!dayInfo) return 'invisible'
    
    const baseClasses = 'aspect-square flex flex-col items-center justify-center rounded-lg p-2 text-sm relative'
    
    if (dayInfo.isPast) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`
    }
    
    if (!dayInfo.availability) {
      return `${baseClasses} bg-gray-50 text-gray-600`
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
            Disponibilidad - {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
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
                  title={dayInfo?.availability ? 
                    `${dayInfo.availability.availableRooms}/${dayInfo.availability.totalRooms} habitaciones disponibles` 
                    : ''}
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
            
            {/* Leyenda */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
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
