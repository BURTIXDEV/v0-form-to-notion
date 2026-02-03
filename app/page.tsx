"use client"

import { useState } from "react"
import { OnboardingForm } from "@/components/onboarding-form"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      {/* Mobile/Tablet Splash Screen */}
      {!showForm && (
        <div className="lg:hidden fixed inset-0 flex flex-col">
          {/* Full screen background image */}
          <div className="absolute inset-0">
            <Image
              src="https://i.postimg.cc/pVhFnGDf/Texto-del-pa-rrafo-860-x-1200-px-3.png"
              alt="MIGO - Bienvenido al proceso de onboarding"
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
          </div>
          {/* Button at bottom */}
          <div className="mt-auto relative z-10 p-6 pb-8 flex justify-center safe-area-bottom">
            <button
              onClick={() => setShowForm(true)}
              className="worm-button px-8 py-3 text-base font-medium text-white bg-transparent border border-white/50 rounded-full hover:border-white transition-colors"
            >
              Comenzar Registro
              <ArrowRight className="ml-2 h-4 w-4 inline" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Form (Full Screen per step) */}
      {showForm && (
        <div className="lg:hidden min-h-screen bg-background flex flex-col">
          {/* Fixed Header */}
          <div className="sticky top-0 z-20 bg-background border-b border-border px-6 py-4">
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span className="text-sm font-medium">Volver</span>
            </button>
          </div>
          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center px-6 py-6">
            <OnboardingForm fullScreen />
          </div>
        </div>
      )}

      {/* Desktop Split Screen */}
      <main className="hidden lg:flex min-h-screen">
        {/* Left Panel - Fixed Background */}
        <div className="fixed left-0 top-0 w-1/2 h-screen z-10">
          <Image
            src="https://i.postimg.cc/T25Mnfy3/Texto-del-pa-rrafo-18.png"
            alt="MIGO Background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Spacer for fixed left panel */}
        <div className="w-1/2 flex-shrink-0" />

        {/* Right Panel - Scrollable Form */}
        <div className="w-1/2 min-h-screen py-12 px-8 flex items-start justify-center bg-background overflow-y-auto">
          <div className="w-full max-w-xl my-auto">
            <OnboardingForm />
          </div>
        </div>
      </main>
    </>
  )
}
