'use client'

import { useState } from 'react'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Users, Bed, Maximize, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function RoomDetailCompact({ room, onClose, showCloseButton = false }) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!room) return null

  const images = room.images && room.images.length > 0 ? room.images : [room.image]

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Images Section */}
          <div className="relative">
            <div className="relative h-64 md:h-full min-h-[300px]">
              <img
                src={images[selectedImage]}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    onClick={previousImage}
                    size="icon"
                    variant="outline"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={nextImage}
                    size="icon"
                    variant="outline"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === selectedImage
                            ? 'w-6 bg-white'
                            : 'w-1.5 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Ver imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Close Button */}
              {showCloseButton && onClose && (
                <Button
                  onClick={onClose}
                  size="icon"
                  variant="outline"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="secondary">{room.roomType}</Badge>
                {room.available !== undefined && (
                  <Badge variant={room.available > 0 ? "success" : "destructive"}>
                    {room.available > 0 ? `${room.available} disponible${room.available > 1 ? 's' : ''}` : 'No disponible'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">{room.name}</h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {room.description}
            </p>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(room.price)}
              </div>
              <div className="text-sm text-gray-500">por noche</div>
            </div>

            {/* Features Grid */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-900">Características</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-700">Hasta {room.maxGuests} huéspedes</span>
                </div>
                
                {room.size && (
                  <div className="flex items-center gap-2 text-sm">
                    <Maximize className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-gray-700">{room.size}</span>
                  </div>
                )}
                
                {room.bedType && (
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-gray-700">{room.bedType}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Comodidades</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
