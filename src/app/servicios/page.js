'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Coffee, 
  Utensils, 
  Dumbbell, 
  Waves, 
  Heart,
  Sparkles,
  Wind,
  UtensilsCrossed,
  Shirt,
  Clock,
  Phone,
  Music,
  Car,
  Wifi,
  Tv,
  AirVent,
  Bath,
  Bed,
  Loader2
} from 'lucide-react'

// Mapa de iconos
const iconMap = {
  Sparkles, Coffee, Utensils, Dumbbell, Waves, Heart,
  Wind, UtensilsCrossed, Shirt, Phone, Music, Car,
  Wifi, Tv, AirVent, Bath, Bed, Clock
}

export default function ServiciosPage() {
  const [featuredServices, setFeaturedServices] = useState([])
  const [mainServices, setMainServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      
      if (response.ok) {
        const featured = data.services.filter(s => s.featured)
        const notFeatured = data.services.filter(s => !s.featured)
        setFeaturedServices(featured)
        setMainServices(notFeatured)
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching services:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Servicios y Amenidades
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre todos los servicios que tenemos para hacer de tu estadía 
              una experiencia inolvidable en el corazón de San Lorenzo.
            </p>
          </div>

          {/* Featured Services - Destacados */}
          {featuredServices.length > 0 && (
            <section className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Servicios Destacados</h2>
                <p className="text-gray-600">Experiencias únicas que no te puedes perder</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {featuredServices.map((service) => {
                  const Icon = iconMap[service.icon] || Sparkles
                  const serviceImages = service.images || []
                  return (
                    <Link key={service.id} href={`/servicios/${service.id}`}>
                      <Card className="overflow-hidden hover:shadow-xl transition-all border-2 border-primary/20 cursor-pointer h-full">
                        {serviceImages.length > 0 && (
                          <div className="relative h-64 overflow-hidden">
                            <img
                              src={serviceImages[0]}
                              alt={service.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-primary text-white">Destacado</Badge>
                            </div>
                          </div>
                        )}
                      <CardHeader>
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg mr-3">
                            <Icon className="h-7 w-7 text-primary" />
                          </div>
                          <CardTitle className="text-2xl">{service.title}</CardTitle>
                        </div>
                        <p className="text-gray-600 text-base">{service.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-primary">Características:</h4>
                            <div className="flex flex-wrap gap-2">
                              {service.features.map((feature, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 pt-2 border-t">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{service.hours}</span>
                          </div>
                        </div>
                      </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Main Services */}
          {mainServices.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Todos Nuestros Servicios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainServices.map((service) => {
                  const Icon = iconMap[service.icon] || Sparkles
                  const serviceImages = service.images || []
                  return (
                    <Link key={service.id} href={`/servicios/${service.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                        {serviceImages.length > 0 && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={serviceImages[0]}
                              alt={service.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      <CardHeader>
                        <div className="flex items-center mb-2">
                          <Icon className="h-5 w-5 text-primary mr-2" />
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                        </div>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {service.features.slice(0, 3).map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {service.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{service.features.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{service.hours}</span>
                          </div>
                        </div>
                      </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
