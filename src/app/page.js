import dynamic from 'next/dynamic'
import { HeroSection } from '@/components/sections/hero-section'
import { FeaturedRooms } from '@/components/sections/featured-rooms'
import { ServicesSection } from '@/components/sections/services-section'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// Lazy loading del mapa (componente pesado con Leaflet)
const MapSection = dynamic(
  () => import('@/components/sections/map-section').then(mod => ({ default: mod.MapSection })),
  { 
    ssr: false,
    loading: () => (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
)

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturedRooms />
        <ServicesSection />
        <MapSection />
      </main>
      <Footer />
    </div>
  )
}
