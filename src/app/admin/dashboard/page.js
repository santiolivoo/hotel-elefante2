'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Building,
  Loader2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#D4C56D', '#748067', '#BBCEA8', '#667eea', '#764ba2']

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Generar lista de años (año actual - 2 hasta año actual + 2)
  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  useEffect(() => {
    fetchDashboardData()
  }, [selectedYear])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/admin/dashboard?year=${selectedYear}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar datos del dashboard')
      }

      const data = await response.json()
      
      setTimeout(() => {
        setDashboardData({
          stats: data.stats,
          revenueData: data.revenueData || [],
          roomTypeData: data.roomTypeData || [],
          recentReservations: data.recentReservations || []
        })
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const { stats, revenueData, roomTypeData, recentReservations } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header con Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Analytics y métricas del hotel</p>
        </div>
        <div className="flex gap-3 items-center">
          <Label htmlFor="year-select" className="text-sm font-medium">
            Año:
          </Label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32" id="year-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/admin/reservas')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reservas {selectedYear}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Check-in en {selectedYear}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/admin/reservas')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos {selectedYear}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Check-in en {selectedYear}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/admin/habitaciones')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ocupación {selectedYear}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Promedio anual de ocupación
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Mes {selectedYear} (por fecha de Check-in)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData && revenueData.length > 0 && revenueData.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Ingresos']}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#D4C56D"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay ingresos registrados aún</p>
                  <p className="text-sm mt-1">Los ingresos se mostrarán según la fecha de check-in</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Room Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo de Habitación {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {roomTypeData && roomTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) => value > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} reservas`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-gray-500">
                <div className="text-center">
                  <Building className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay datos de reservas por tipo de habitación en {selectedYear}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
