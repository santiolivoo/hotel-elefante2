import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider.js'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Hotel Elefante - San Lorenzo, Salta',
  description: 'Hotel Elefante, ubicado en San Lorenzo, Salta, Argentina. Cerca del Cerro Elefante. Sistema de gestión hotelera completo.',
  keywords: 'hotel, salta, san lorenzo, cerro elefante, argentina, reservas',
  authors: [{ name: 'Hotel Elefante' }],
  openGraph: {
    title: 'Hotel Elefante - San Lorenzo, Salta',
    description: 'Hotel Elefante, ubicado en San Lorenzo, Salta, Argentina. Cerca del Cerro Elefante.',
    url: 'https://hotelelefante.com',
    siteName: 'Hotel Elefante',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
