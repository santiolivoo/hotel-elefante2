'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

export function HotelMap({ height = 400 }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Solo cargar en el cliente
    if (typeof window === 'undefined') return

    let mounted = true

    const initMap = async () => {
      try {
        // Coordenadas exactas del hotel
        const hotelCoordinates = [-24.727537537684505, -65.51412194935236]

        // Importar leaflet dinámicamente
        const L = (await import('leaflet')).default

        // Importar CSS de leaflet
        await import('leaflet/dist/leaflet.css')

        // Fix para los iconos de leaflet
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        if (!mounted) return

        // Crear el mapa
        const map = L.map(mapRef.current).setView(hotelCoordinates, 15)

        // Agregar capa de tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map)

        // Agregar marcador del hotel
        const marker = L.marker(hotelCoordinates).addTo(map)
        marker.bindPopup(`
          <div style="text-align: center;">
            <strong style="font-size: 16px;">🏨 Hotel Elefante</strong><br/>
            <span style="font-size: 14px;">San Lorenzo, Salta, Argentina</span><br/>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${hotelCoordinates[0]},${hotelCoordinates[1]}" 
               target="_blank" 
               style="color: #4A90E2; text-decoration: underline; font-size: 12px;">
              Cómo llegar
            </a>
          </div>
        `).openPopup()

        mapInstanceRef.current = map

        setIsLoading(false)
      } catch (err) {
        console.error('Error loading map:', err)
        if (mounted) {
          setError('No se pudo cargar el mapa')
          setIsLoading(false)
        }
      }
    }

    initMap()

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  if (error) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"
        style={{ height: `${height}px` }}
      >
        <div className="text-center p-8">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ height: `${height}px`, width: '100%' }}
      />
    </div>
  )
}

// Componente para mostrar información de ubicación
export function LocationInfo() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Información de Ubicación</h3>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <span className="w-6 h-6 mr-3 text-primary">📍</span>
          <div>
            <p className="font-medium">Hotel Elefante</p>
            <p className="text-sm text-gray-600">San Lorenzo, Salta, Argentina</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="w-6 h-6 mr-3 text-primary">🏔️</span>
          <div>
            <p className="font-medium">Altitud</p>
            <p className="text-sm text-gray-600">1,350 metros sobre el nivel del mar</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="w-6 h-6 mr-3 text-primary">🚗</span>
          <div>
            <p className="font-medium">Acceso</p>
            <p className="text-sm text-gray-600">20 minutos desde Salta capital</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="w-6 h-6 mr-3 text-primary">✈️</span>
          <div>
            <p className="font-medium">Aeropuerto</p>
            <p className="text-sm text-gray-600">25 km del Aeropuerto de Salta</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook para verificar si Leaflet está disponible
export function useLeaflet() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then(() => {
        setIsLoaded(true)
      })
    }
  }, [])

  return isLoaded
}
