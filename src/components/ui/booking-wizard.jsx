'use client'

import { Check } from 'lucide-react'
import { Card, CardContent } from './card'

const steps = [
  { id: 1, name: 'Fechas y Huéspedes', description: 'Selecciona tus fechas' },
  { id: 2, name: 'Habitación', description: 'Elige tu habitación' },
  { id: 3, name: 'Confirmación', description: 'Confirma tu reserva' },
]

export function BookingWizard({ currentStep }) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => (
              <li 
                key={step.id} 
                className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex items-center">
                  <div className="flex items-center">
                    {/* Step Circle */}
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        currentStep > step.id
                          ? 'border-primary bg-primary'
                          : currentStep === step.id
                          ? 'border-primary bg-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            currentStep === step.id
                              ? 'text-primary'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.id}
                        </span>
                      )}
                    </div>
                    
                    {/* Step Text */}
                    <div className="ml-3 hidden sm:block">
                      <div
                        className={`text-sm font-medium ${
                          currentStep >= step.id
                            ? 'text-primary'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {stepIdx !== steps.length - 1 && (
                    <div
                      className={`ml-4 h-0.5 flex-1 ${
                        currentStep > step.id
                          ? 'bg-primary'
                          : 'bg-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                
                {/* Mobile Step Text */}
                <div className="mt-2 sm:hidden text-center">
                  <div
                    className={`text-xs font-medium ${
                      currentStep >= step.id
                        ? 'text-primary'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </CardContent>
    </Card>
  )
}
