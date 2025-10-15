'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Image as ImageIcon,
  Clock,
  Star,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Upload,
  X
} from 'lucide-react'

// Íconos disponibles para los servicios
const availableIcons = [
  'Sparkles', 'Coffee', 'Utensils', 'Dumbbell', 'Waves', 'Heart',
  'Wind', 'UtensilsCrossed', 'Shirt', 'Phone', 'Music', 'Car',
  'Wifi', 'Tv', 'AirVent', 'Bath', 'Bed', 'Clock'
]

export default function AdminServiciosPage() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Sparkles',
    features: [''],
    hours: '',
    images: [],
    featured: false,
    active: true,
    order: 0
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      const data = await response.json()
      
      if (response.ok) {
        setServices(data.services)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los servicios',
          variant: 'destructive',
        })
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los servicios',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service)
      const existingImages = service.images || []
      setFormData({
        title: service.title,
        description: service.description,
        icon: service.icon,
        features: service.features.length > 0 ? service.features : [''],
        hours: service.hours,
        images: existingImages,
        featured: service.featured,
        active: service.active,
        order: service.order
      })
      setImagePreviews(existingImages)
      setImageFiles([])
    } else {
      setEditingService(null)
      setFormData({
        title: '',
        description: '',
        icon: 'Sparkles',
        features: [''],
        hours: '',
        images: [],
        featured: false,
        active: true,
        order: 0
      })
      setImagePreviews([])
      setImageFiles([])
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingService(null)
    setImageFiles([])
    setImagePreviews([])
    setFormData({
      title: '',
      description: '',
      icon: 'Sparkles',
      features: [''],
      hours: '',
      images: [],
      featured: false,
      active: true,
      order: 0
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))
  }

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, features: newFeatures.length > 0 ? newFeatures : [''] }))
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files])
      
      // Crear previews para los nuevos archivos
      const newPreviews = []
      for (const file of files) {
        const preview = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
        newPreviews.push(preview)
      }
      
      setImagePreviews(prev => [...prev, ...newPreviews])
    }
  }

  const handleRemoveImage = (index) => {
    const numExistingImages = formData.images.length
    
    if (index < numExistingImages) {
      // Es una imagen existente (de BD)
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, images: newImages }))
      setImagePreviews(prev => prev.filter((_, i) => i !== index))
    } else {
      // Es una imagen nueva (archivo)
      const fileIndex = index - numExistingImages
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex))
      setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Filtrar features vacías
      const filteredFeatures = formData.features.filter(f => f.trim() !== '')

      let allImages = [...formData.images]
      
      // Subir imágenes nuevas
      if (imageFiles.length > 0) {
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
            toast({
              title: 'Error al subir imagen',
              description: errorData.error || 'Verifica que Supabase esté configurado correctamente',
              variant: 'destructive',
            })
            setIsSaving(false)
            return // No continuar si hay error al subir imágenes
          }
        }
      }

      const body = {
        title: formData.title,
        description: formData.description,
        icon: formData.icon,
        features: filteredFeatures,
        hours: formData.hours,
        images: allImages,
        featured: formData.featured,
        active: formData.active,
        order: formData.order
      }

      console.log('Enviando servicio:', body)

      const url = editingService 
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services'
      
      const method = editingService ? 'PATCH' : 'POST'

      console.log(`${method} ${url}`)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        toast({
          title: editingService ? 'Servicio actualizado' : 'Servicio creado',
          description: `El servicio ha sido ${editingService ? 'actualizado' : 'creado'} exitosamente`,
        })
        fetchServices()
        handleCloseDialog()
      } else {
        const error = await response.json()
        console.error('Error del servidor:', error)
        toast({
          title: 'Error',
          description: error.error || 'No se pudo guardar el servicio',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving service:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar el servicio',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`¿Está seguro que desea eliminar el servicio "${title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast({
          title: 'Servicio eliminado',
          description: 'El servicio ha sido eliminado exitosamente',
        })
        fetchServices()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'No se pudo eliminar el servicio',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el servicio',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (service) => {
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !service.active }),
      })
      
      if (response.ok) {
        toast({
          title: 'Estado actualizado',
          description: `El servicio ha sido ${!service.active ? 'activado' : 'desactivado'}`,
        })
        fetchServices()
      }
    } catch (error) {
      console.error('Error toggling service:', error)
    }
  }

  const handleMoveService = async (service, direction) => {
    const currentIndex = services.findIndex(s => s.id === service.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (targetIndex < 0 || targetIndex >= services.length) return

    try {
      // Actualizar orden del servicio actual
      await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: services[targetIndex].order }),
      })

      // Actualizar orden del servicio objetivo
      await fetch(`/api/admin/services/${services[targetIndex].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: service.order }),
      })

      fetchServices()
    } catch (error) {
      console.error('Error moving service:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Servicios</h1>
          <p className="text-gray-600 mt-1">Administra los servicios del hotel</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Destacados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {services.filter(s => s.featured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {services.filter(s => !s.active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Orden</TableHead>
                <TableHead>Imágenes</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Características</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No hay servicios registrados
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service, index) => {
                  const serviceImages = service.images || []
                  return (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMoveService(service, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMoveService(service, 'down')}
                          disabled={index === services.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {serviceImages.length > 0 ? (
                          serviceImages.slice(0, 3).map((img, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                              <img 
                                src={img} 
                                alt={`${service.title} ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        {serviceImages.length > 3 && (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                            +{serviceImages.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {service.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        <div>
                          <div className="font-medium">{service.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        {service.hours}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={service.active ? 'success' : 'secondary'}>
                          {service.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleToggleActive(service)}
                        >
                          {service.active ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {service.features.length} característica{service.features.length !== 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(service.id, service.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  placeholder="Ej: Casino & Entretenimiento"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={3}
                  placeholder="Describe el servicio..."
                />
              </div>

              <div>
                <Label htmlFor="icon">Ícono *</Label>
                <select
                  id="icon"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  required
                >
                  {availableIcons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="hours">Horario *</Label>
                <Input
                  id="hours"
                  value={formData.hours}
                  onChange={(e) => handleInputChange('hours', e.target.value)}
                  required
                  placeholder="Ej: Todos los días: 8:00 - 20:00"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="images">Imágenes del Servicio</Label>
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
                      id="images"
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
                </div>
              </div>

              <div>
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">Destacado</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => handleInputChange('active', checked)}
                  />
                  <Label htmlFor="active" className="cursor-pointer">Activo</Label>
                </div>
              </div>

              <div className="col-span-2">
                <Label>Características</Label>
                <div className="space-y-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Característica ${index + 1}`}
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Característica
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingService ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
