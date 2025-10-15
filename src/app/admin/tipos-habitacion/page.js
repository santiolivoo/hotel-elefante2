'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Bed, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Loader2,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function TiposHabitacionPage() {
  const { data: session } = useSession()
  const [roomTypes, setRoomTypes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const { toast } = useToast()
  
  const isAdmin = session?.user?.role === 'ADMIN'

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
      console.error('Error fetching room types:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar los tipos de habitación',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveType = async (formData) => {
    try {
      console.log('Enviando datos:', formData)
      
      const url = editingType 
        ? `/api/admin/room-types/${editingType.id}` 
        : '/api/admin/room-types'
      
      const method = editingType ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      console.log('Respuesta del servidor:', data)
      
      if (response.ok) {
        toast({
          title: editingType ? 'Tipo actualizado' : 'Tipo creado',
          description: `El tipo de habitación ha sido ${editingType ? 'actualizado' : 'creado'} exitosamente`,
        })
        fetchRoomTypes()
        setShowDialog(false)
        setEditingType(null)
      } else {
        throw new Error(data.error || data.message || 'Error desconocido')
      }
    } catch (error) {
      console.error('Error completo:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el tipo de habitación',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (type) => {
    setEditingType(type)
    setShowDialog(true)
  }

  const handleDelete = async (typeId) => {
    if (!confirm('¿Estás seguro de eliminar este tipo de habitación? Esto afectará a todas las habitaciones de este tipo.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/room-types/${typeId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast({
          title: 'Tipo eliminado',
          description: 'El tipo de habitación ha sido eliminado exitosamente',
        })
        fetchRoomTypes()
      } else {
        const data = await response.json()
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el tipo de habitación',
        variant: 'destructive',
      })
    }
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingType(null)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tipos de Habitación</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin 
              ? 'Gestiona los tipos de habitación disponibles en el hotel'
              : 'Visualiza y actualiza imágenes de los tipos de habitación'
            }
          </p>
        </div>
        {isAdmin && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingType(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Tipo
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'Editar Tipo de Habitación' : 'Crear Tipo de Habitación'}
              </DialogTitle>
              <DialogDescription>
                {editingType 
                  ? 'Modifica la información del tipo de habitación'
                  : 'Completa la información para crear un nuevo tipo de habitación'
                }
              </DialogDescription>
            </DialogHeader>
            <RoomTypeForm 
              editingType={editingType} 
              onSubmit={handleSaveType} 
              onCancel={handleCloseDialog}
            />
          </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tipos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {roomTypes.length}
                </p>
              </div>
              <Bed className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {roomTypes.length > 0 
                    ? formatCurrency(roomTypes.reduce((sum, t) => sum + parseFloat(t.basePrice), 0) / roomTypes.length)
                    : formatCurrency(0)
                  }
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Capacidad Máx</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {roomTypes.length > 0 ? Math.max(...roomTypes.map(t => t.maxGuests)) : 0} huéspedes
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Habitación ({roomTypes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción Corta</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Huéspedes Máx</TableHead>
                <TableHead>Habitaciones</TableHead>
                <TableHead>Acciones</TableHead>
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
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{type.shortDescription || '-'}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(type.basePrice)}
                  </TableCell>
                  <TableCell>{type.maxGuests} personas</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{type._count?.rooms || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(type)}
                        title={isAdmin ? "Editar tipo" : "Actualizar imagen"}
                      >
                        {isAdmin ? <Edit className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                      </Button>
                      {isAdmin && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(type.id)}
                          title="Eliminar tipo"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function RoomTypeForm({ editingType, onSubmit, onCancel }) {
  const getExistingImages = () => {
    try {
      if (editingType?.images) {
        return JSON.parse(editingType.images)
      }
      if (editingType?.imageUrl) {
        return [editingType.imageUrl]
      }
      return []
    } catch (error) {
      console.error('Error parsing images:', error)
      return editingType?.imageUrl ? [editingType.imageUrl] : []
    }
  }
  
  const existingImages = getExistingImages()
  
  const [formData, setFormData] = useState({
    name: editingType?.name || '',
    shortDescription: editingType?.shortDescription || '',
    description: editingType?.description || '',
    basePrice: editingType?.basePrice || '',
    maxGuests: editingType?.maxGuests || '',
    size: editingType?.size || '',
    bedType: editingType?.bedType || '',
    images: existingImages
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState(existingImages)

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files])
      
      // Crear previews para las nuevas imágenes
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    // Si es una imagen existente (URL), removerla del formData
    if (typeof imagePreviews[index] === 'string' && imagePreviews[index].startsWith('/')) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    } else {
      // Si es un archivo nuevo, removerlo de imageFiles
      const fileIndex = index - formData.images.length
      if (fileIndex >= 0) {
        setImageFiles(prev => prev.filter((_, i) => i !== fileIndex))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    let allImages = [...formData.images]
    
    // Si hay imágenes nuevas, subirlas primero
    if (imageFiles.length > 0) {
      try {
        for (const file of imageFiles) {
          const uploadFormData = new FormData()
          uploadFormData.append('image', file)
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          })
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            allImages.push(uploadData.url)
          } else {
            const errorData = await uploadResponse.json()
            console.error('Error al subir imagen:', errorData)
            throw new Error(errorData.error || 'Error al subir la imagen')
          }
        }
      } catch (error) {
        console.error('Error uploading images:', error)
        alert(`Error al subir imágenes: ${error.message}. Verifica que Supabase esté configurado correctamente.`)
        return // No continuar con el guardado si las imágenes fallan
      }
    }
    
    onSubmit({
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      maxGuests: parseInt(formData.maxGuests),
      images: allImages,
      imageUrl: allImages[0] || null // Mantener compatibilidad
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del Tipo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Suite Deluxe"
          required
        />
      </div>

      <div>
        <Label htmlFor="shortDescription">Descripción Corta</Label>
        <Textarea
          id="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
          placeholder="Descripción breve para landing, lista y reservas (máx. 100 caracteres)"
          rows={2}
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">
          Se mostrará en: Landing, Lista de Habitaciones y Reservas
        </p>
      </div>

      <div>
        <Label htmlFor="description">Descripción Detallada</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descripción completa con todas las características..."
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          Se mostrará solo en: Página de Detalles (/habitaciones/[id])
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="basePrice">Precio Base (por noche)</Label>
          <Input
            id="basePrice"
            type="number"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
            placeholder="15000"
            required
          />
        </div>
        <div>
          <Label htmlFor="maxGuests">Huéspedes Máximos</Label>
          <Input
            id="maxGuests"
            type="number"
            value={formData.maxGuests}
            onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: e.target.value }))}
            placeholder="2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="size">Tamaño de Habitación</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
            placeholder="Ej: 35 m²"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se mostrará en la página de detalles
          </p>
        </div>
        <div>
          <Label htmlFor="bedType">Tipo de Cama</Label>
          <Input
            id="bedType"
            value={formData.bedType}
            onChange={(e) => setFormData(prev => ({ ...prev, bedType: e.target.value }))}
            placeholder="Ej: Cama king size"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se mostrará en la página de detalles
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="image">Imágenes del Tipo</Label>
        <div className="mt-2">
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2 bg-primary">Principal</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="flex-1"
            />
            <Upload className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Puedes seleccionar múltiples imágenes. La primera será la imagen principal.
          </p>
          <p className="text-sm text-gray-500">
            Formatos aceptados: JPG, PNG, WebP
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingType ? 'Actualizar Tipo' : 'Crear Tipo'}
        </Button>
      </div>
    </form>
  )
}
