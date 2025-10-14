'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  BarChart3, 
  Building, 
  Users, 
  Menu, 
  X, 
  LogOut, 
  User,
  Home,
  Calendar,
  Eye,
  Bed,
  Sparkles
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: BarChart3
  },
  {
    name: 'Reservas',
    href: '/admin/reservas',
    icon: Calendar
  },
  {
    name: 'Tipos de Habitación',
    href: '/admin/tipos-habitacion',
    icon: Bed
  },
  {
    name: 'Habitaciones',
    href: '/admin/habitaciones',
    icon: Building
  },
  {
    name: 'Servicios',
    href: '/admin/servicios',
    icon: Sparkles
  },
  {
    name: 'Operadores y Usuarios',
    href: '/admin/operadores',
    icon: Users
  }
]

export default function AdminLayout({ children }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Panel Admin</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 flex-1">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="p-4 border-t space-y-2">
              <Link href="/operador/mapa" className="w-full" onClick={() => setSidebarOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="mr-2 h-4 w-4" />
                  Vista Operador
                </Button>
              </Link>
              <Link href="/" className="w-full" onClick={() => setSidebarOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Ir al Sitio Web
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Card className="flex-1 m-4 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <Link href="/" className="text-xl font-bold text-primary">
                Hotel Elefante
              </Link>
              <p className="text-sm text-gray-600 mt-1">Panel Administrador</p>
            </div>
            
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            
            <div className="p-4 border-t">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Link href="/operador/mapa" className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Eye className="mr-2 h-4 w-4" />
                    Vista Operador
                  </Button>
                </Link>
                <Link href="/" className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Ir al Sitio Web
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Panel Admin</h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
