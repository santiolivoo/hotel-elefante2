'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDashboard } from '@/hooks/useDashboard'
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
  Loader2,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#D4C56D', '#748067', '#BBCEA8', '#667eea', '#764ba2']

export default function AdminDashboardPage() {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Generar lista de años (año actual - 2 hasta año actual + 2)
  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  // Usar React Query para obtener datos del dashboard
  const { data, isLoading, isError } = useDashboard(selectedYear)

  // Preparar datos con valores por defecto
  const dashboardData = data ? {
    stats: data.stats,
    revenueData: data.revenueData || [],
    roomTypeData: data.roomTypeData || [],
  } : {
    stats: {
      activeReservations: 0,
      checkInsToday: 0,
      checkOutsToday: 0,
      pendingPayments: 0,
      newMessages: 0,
      totalReservations: 0,
      totalRevenue: 0,
      occupancyRate: 0
    },
    revenueData: [],
    roomTypeData: [],
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Safety check - should not happen but prevents null destructuring
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar el dashboard
          </h3>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los datos. Por favor, intenta recargar la página.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
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

      {/* Stats Diarias - Prioridad alta */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/admin/reservas?dateRange=current')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Huéspedes Activos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeReservations || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Click para ver - Actualmente en el hotel
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/admin/reservas?dateRange=today')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-ins Hoy</p>
                <p className="text-2xl font-bold text-green-600">{stats.checkInsToday || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Click para ver - Llegadas de hoy
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/admin/reservas?dateRange=checkouts_today')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-outs Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{stats.checkOutsToday || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Click para ver - Salidas de hoy
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/admin/reservas?status=PENDING_PAYMENT')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingPayments || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Click para ver - Requieren atención
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/operador/mensajes')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensajes Nuevos</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.newMessages || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Sin responder
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Anuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push(`/admin/reservas?dateRange=custom&customDateFrom=${selectedYear}-01-01&customDateTo=${selectedYear}-12-31`)}
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
                Click para ver - Check-in en {selectedYear}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push(`/admin/reservas?dateRange=custom&customDateFrom=${selectedYear}-01-01&customDateTo=${selectedYear}-12-31`)}
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
                Click para ver - Check-in en {selectedYear}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
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
                <BarChart 
                  data={revenueData}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const clickedData = data.activePayload[0].payload
                      if (clickedData && clickedData.monthNumber) {
                        const monthStr = String(clickedData.monthNumber).padStart(2, '0')
                        const fromDate = `${selectedYear}-${monthStr}-01`
                        const lastDay = new Date(selectedYear, clickedData.monthNumber, 0).getDate()
                        const toDate = `${selectedYear}-${monthStr}-${String(lastDay).padStart(2, '0')}`
                        router.push(`/admin/reservas?dateRange=custom&customDateFrom=${fromDate}&customDateTo=${toDate}`)
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Ingresos']}
                    labelFormatter={(label) => `Mes: ${label}`}
                    cursor={{ fill: 'rgba(212, 197, 109, 0.2)' }}
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
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
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
