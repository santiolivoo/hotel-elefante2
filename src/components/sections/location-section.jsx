'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HotelMap } from '@/components/map/hotel-map'
import { MapPin, Mountain, TreePine, Camera } from 'lucide-react'

export function LocationSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const attractions = [
    {
      icon: Mountain,
      name: 'Cerro Elefante',
      distance: '2 km',
      description: 'Formación rocosa icónica con forma de elefante, perfecta para senderismo y fotografía.'
    },
    {
      icon: TreePine,
      name: 'Quebrada de San Lorenzo',
      distance: '1 km',
      description: 'Hermoso paisaje natural con senderos y cascadas ideales para trekking.'
    },
    {
      icon: Camera,
      name: 'Mirador del Valle',
      distance: '3 km',
      description: 'Vista panorámica espectacular del valle de Lerma y la ciudad de Salta.'
    },
    {
      icon: MapPin,
      name: 'Centro de San Lorenzo',
      distance: '500 m',
      description: 'Pueblo pintoresco con arquitectura colonial y gastronomía local.'
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ubicación Privilegiada
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estratégicamente ubicado en San Lorenzo, Salta, con acceso directo a las 
            principales atracciones naturales y culturales de la región.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Map Container */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <HotelMap height={384} showAttractionsRadius={true} />
              </CardContent>
            </Card>
          </div>

          {/* Attractions */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Atracciones Cercanas
            </h3>
            <div className="space-y-4">
              {attractions.map((attraction, index) => {
                const Icon = attraction.icon
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{attraction.name}</h4>
                            <span className="text-sm text-primary font-medium">{attraction.distance}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{attraction.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Location Info */}
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Información de Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distancia a Salta Capital:</span>
                    <span className="font-medium">12 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiempo en auto:</span>
                    <span className="font-medium">20 minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aeropuerto más cercano:</span>
                    <span className="font-medium">Aeropuerto de Salta (25 km)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Altitud:</span>
                    <span className="font-medium">1,350 msnm</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transportation */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Cómo Llegar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-2xl">🚗</span>
                </div>
                <CardTitle className="text-lg">En Auto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Desde Salta capital, tomar la Ruta Provincial 28 hacia San Lorenzo. 
                  Estacionamiento gratuito disponible.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-2xl">🚌</span>
                </div>
                <CardTitle className="text-lg">Transporte Público</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Líneas de colectivos regulares desde el centro de Salta. 
                  Parada a 200 metros del hotel.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-2xl">✈️</span>
                </div>
                <CardTitle className="text-lg">Desde el Aeropuerto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Transfer privado disponible. Taxi o remis desde el Aeropuerto 
                  Internacional de Salta (25 km).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
