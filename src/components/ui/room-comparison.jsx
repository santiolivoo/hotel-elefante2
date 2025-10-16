'use client'

import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Users, Bed, Maximize, X, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function RoomComparison({ rooms, onRemoveRoom, onSelectRoom }) {
  if (!rooms || rooms.length === 0) return null

  const features = [
    { key: 'price', label: 'Precio por noche', icon: null },
    { key: 'maxGuests', label: 'Capacidad', icon: Users },
    { key: 'size', label: 'Tamaño', icon: Maximize },
    { key: 'bedType', label: 'Tipo de cama', icon: Bed },
    { key: 'roomType', label: 'Tipo', icon: null },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparación de Habitaciones ({rooms.length}/3)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 border-b font-medium text-gray-700">
                  Característica
                </th>
                {rooms.map((room) => (
                  <th key={room.id} className="p-2 border-b">
                    <div className="relative">
                      {/* Remove Button */}
                      <Button
                        onClick={() => onRemoveRoom(room.id)}
                        size="icon"
                        variant="ghost"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      
                      {/* Room Image */}
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      
                      {/* Room Name */}
                      <div className="font-semibold text-sm mb-1">{room.name}</div>
                      <Badge variant="secondary" className="text-xs">
                        {room.roomType}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.key} className="border-b">
                  <td className="p-3 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      {feature.icon && <feature.icon className="h-4 w-4 text-primary" />}
                      {feature.label}
                    </div>
                  </td>
                  {rooms.map((room) => (
                    <td key={room.id} className="p-3 text-center">
                      {feature.key === 'price' ? (
                        <div className="font-bold text-primary">
                          {formatCurrency(room.price)}
                        </div>
                      ) : feature.key === 'maxGuests' ? (
                        <span>{room.maxGuests} huéspedes</span>
                      ) : room[feature.key] ? (
                        <span>{room[feature.key]}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Amenities Row */}
              <tr className="border-b">
                <td className="p-3 font-medium text-gray-700">Comodidades</td>
                {rooms.map((room) => (
                  <td key={room.id} className="p-3">
                    {room.amenities && room.amenities.length > 0 ? (
                      <div className="space-y-1 text-xs">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-600" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                        {room.amenities.length > 3 && (
                          <div className="text-primary">
                            +{room.amenities.length - 3} más
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>
              
              {/* Action Row */}
              <tr>
                <td className="p-3 font-medium text-gray-700">Acción</td>
                {rooms.map((room) => (
                  <td key={room.id} className="p-3">
                    <Button
                      onClick={() => onSelectRoom(room)}
                      className="w-full"
                      size="sm"
                      disabled={room.available === 0}
                    >
                      {room.available > 0 ? 'Seleccionar' : 'No disponible'}
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Mobile Warning */}
        <div className="md:hidden mt-4 text-sm text-gray-500 text-center">
          Desliza horizontalmente para ver todas las columnas
        </div>
      </CardContent>
    </Card>
  )
}
