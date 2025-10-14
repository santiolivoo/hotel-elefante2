'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Loader2,
  ArrowLeft,
  Star,
  CheckCircle
} from 'lucide-react'

// Mapa de iconos
const iconMap = {
  Sparkles, Coffee, Utensils, Dumbbell, Waves, Heart,
  Wind, UtensilsCrossed, Shirt, Phone, Music, Car,
  Wifi, Tv, AirVent, Bath, Bed, Clock
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchService()
    }
  }, [params.id])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setService(data.service)
      } else {
        router.push('/servicios')
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching service:', error)
      router.push('/servicios')
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

  if (!service) {
    return null
  }

  const Icon = iconMap[service.icon] || Sparkles
  const serviceImages = service.images || []

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/servicios')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Servicios
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {serviceImages.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="relative h-96 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={serviceImages[currentImageIndex]}
                      alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {service.featured && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary text-white flex items-center gap-1">
                          <Star className="h-3 w-3 fill-white" />
                          Destacado
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {serviceImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {serviceImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? 'border-primary ring-2 ring-primary ring-opacity-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Icon className="h-24 w-24 text-primary opacity-50" />
                </div>
              )}
            </div>

            {/* Service Details */}
            <div className="space-y-6">
              {/* Title and Icon */}
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h1>
                    {service.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Star className="h-3 w-3 mr-1 fill-yellow-600" />
                        Servicio Destacado
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Horario */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Horario de Atención</p>
                      <p className="text-blue-700">{service.hours}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Características */}
              {service.features && service.features.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    Características
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Disfruta de todos nuestros servicios
              </h2>
              <p className="text-gray-600 mb-6">
                En Hotel Elefante nos esforzamos por ofrecer la mejor experiencia a nuestros huéspedes.
                Todos nuestros servicios están diseñados para hacer de tu estadía un momento inolvidable.
              </p>
              <Button
                variant="default"
                size="lg"
                onClick={() => router.push('/servicios')}
              >
                Ver Todos los Servicios
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
