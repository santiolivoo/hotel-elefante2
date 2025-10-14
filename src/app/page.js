import { HeroSection } from '@/components/sections/hero-section'
import { FeaturedRooms } from '@/components/sections/featured-rooms'
import { ServicesSection } from '@/components/sections/services-section'
import { MapSection } from '@/components/sections/map-section'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

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
