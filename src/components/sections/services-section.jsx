'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export function ServicesSection() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?featured=true')
      const data = await response.json()
      
      if (response.ok) {
        // Mostrar los primeros 4 servicios destacados
        setServices(data.services.slice(0, 4))
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching services:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (services.length === 0) {
    return null
  }
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Servicios Destacados
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const serviceImages = service.images || []
            const mainImage = serviceImages.length > 0 ? serviceImages[0] : service.imageUrl
            
            return (
              <Link key={service.id} href={`/servicios/${service.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {mainImage && (
                    <div className="relative h-64 w-full">
                      <Image
                        src={mainImage}
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-xl mb-3">{service.title}</h3>
                    <p className="text-gray-600 text-base leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/servicios">
            <Button size="lg" variant="outline">
              Ver Todos los Servicios
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
