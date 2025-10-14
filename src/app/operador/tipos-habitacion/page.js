'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { 
  Bed, 
  Users,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Info
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function OperadorTiposHabitacionPage() {
  const [roomTypes, setRoomTypes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/admin/room-types')
      const data = await response.json()
      
      if (response.ok) {
        setRoomTypes(data.roomTypes)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los tipos de habitación',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error loading room types:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar los tipos de habitación',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tipos de Habitación</h1>
        <p className="text-gray-600">Consulta la información de los tipos de habitación disponibles</p>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Solo visualización</p>
              <p>Esta página es de consulta. Para modificar tipos de habitación o gestionar imágenes, contacta al administrador.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Tipos</p>
                <p className="text-3xl font-bold text-gray-900">{roomTypes.length}</p>
              </div>
              <Bed className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roomTypes.length > 0 
                    ? formatCurrency(roomTypes.reduce((sum, type) => sum + parseFloat(type.basePrice), 0) / roomTypes.length)
                    : '$0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Habitaciones</p>
                <p className="text-3xl font-bold text-gray-900">
                  {roomTypes.reduce((sum, type) => sum + (type._count?.rooms || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Tipos ({roomTypes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imágenes</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Habitaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomTypes.map((type) => {
                let images = []
                try {
                  images = type.images ? JSON.parse(type.images) : (type.imageUrl ? [type.imageUrl] : [])
                } catch (error) {
                  console.error('Error parsing images for type:', type.id, error)
                  images = type.imageUrl ? [type.imageUrl] : []
                }
                return (
                <TableRow key={type.id}>
                  <TableCell>
                    <div className="flex gap-1">
                      {images.length > 0 ? (
                        images.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img 
                              src={img} 
                              alt={`${type.name} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      {images.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                          +{images.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{type.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {type.shortDescription || type.description || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-primary">
                      {formatCurrency(type.basePrice)}
                      <span className="text-xs font-normal text-gray-500 block">por noche</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{type.maxGuests}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {type._count?.rooms || 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>

          {roomTypes.length === 0 && (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay tipos de habitación registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.map((type) => {
          let images = []
          try {
            images = type.images ? JSON.parse(type.images) : (type.imageUrl ? [type.imageUrl] : [])
          } catch (error) {
            images = type.imageUrl ? [type.imageUrl] : []
          }
          const mainImage = images[0] || '/placeholder-room.jpg'

          return (
            <Card key={type.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={mainImage} 
                  alt={type.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <Badge className="absolute top-3 right-3 bg-black/70">
                    {images.length} fotos
                  </Badge>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{type.name}</h3>
                
                {type.shortDescription && (
                  <p className="text-sm text-gray-600 mb-4">{type.shortDescription}</p>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Precio base</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(type.basePrice)}/noche
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Capacidad</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{type.maxGuests} personas</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Habitaciones</span>
                    <Badge variant="secondary">{type._count?.rooms || 0}</Badge>
                  </div>
                </div>

                {type.description && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary font-medium mb-2">
                      Ver descripción completa
                    </summary>
                    <p className="text-gray-600 mt-2">{type.description}</p>
                  </details>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
