'use client'

import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Label } from './label'
import { Input } from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Button } from './button'
import { SlidersHorizontal, X } from 'lucide-react'

export function RoomFilters({ filters, onFiltersChange, onClearFilters }) {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <SlidersHorizontal className="h-5 w-5 mr-2 text-primary" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-primary hover:text-primary/80"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Range */}
        <div className="space-y-2">
          <Label htmlFor="maxPrice">Precio máximo por noche</Label>
          <div className="flex items-center gap-2">
            <Input
              id="maxPrice"
              type="number"
              placeholder="Sin límite"
              value={filters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              min="0"
              step="1000"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">ARS</span>
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label htmlFor="minCapacity">Capacidad mínima</Label>
          <Select 
            value={filters.minCapacity || 'all'} 
            onValueChange={(value) => handleChange('minCapacity', value)}
          >
            <SelectTrigger id="minCapacity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="1">1+ huésped</SelectItem>
              <SelectItem value="2">2+ huéspedes</SelectItem>
              <SelectItem value="3">3+ huéspedes</SelectItem>
              <SelectItem value="4">4+ huéspedes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Room Type */}
        <div className="space-y-2">
          <Label htmlFor="roomType">Tipo de habitación</Label>
          <Select 
            value={filters.roomType || 'all'} 
            onValueChange={(value) => handleChange('roomType', value)}
          >
            <SelectTrigger id="roomType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="STANDARD">Estándar</SelectItem>
              <SelectItem value="DELUXE">Deluxe</SelectItem>
              <SelectItem value="SUITE">Suite</SelectItem>
              <SelectItem value="PRESIDENTIAL">Presidencial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bed Type */}
        <div className="space-y-2">
          <Label htmlFor="bedType">Tipo de cama</Label>
          <Select 
            value={filters.bedType || 'all'} 
            onValueChange={(value) => handleChange('bedType', value)}
          >
            <SelectTrigger id="bedType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Doble">Doble</SelectItem>
              <SelectItem value="Queen">Queen</SelectItem>
              <SelectItem value="King">King</SelectItem>
              <SelectItem value="2 Individuales">2 Individuales</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">Ordenar por</Label>
          <Select 
            value={filters.sortBy || 'relevance'} 
            onValueChange={(value) => handleChange('sortBy', value)}
          >
            <SelectTrigger id="sortBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevancia</SelectItem>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="capacity-desc">Capacidad: mayor a menor</SelectItem>
              <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
