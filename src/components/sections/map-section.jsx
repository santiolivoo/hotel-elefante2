import { HotelMap } from '@/components/map/hotel-map'

export function MapSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestra Ubicación
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontranos en San Lorenzo, Salta, en el emblemático Cerro Elefante
          </p>
        </div>

        <div className="mb-8">
          <HotelMap height={500} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-gray-50 rounded-lg">
          </div>
        </div>
      </div>
    </section>
  )
}
