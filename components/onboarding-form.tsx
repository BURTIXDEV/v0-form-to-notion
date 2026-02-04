"use client"

import React from "react"

import { useState, useEffect } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { submitOnboarding } from "@/app/actions"
import {
  User,
  Building2,
  FileText,
  Landmark,
  Settings,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Upload,
  X,
  ImageIcon,
  FileIcon,
  ArrowLeft,
} from "lucide-react"


const steps = [
  { id: 1, name: "Representante", icon: User },
  { id: 2, name: "Negocio", icon: Building2 },
  { id: 3, name: "Documentos", icon: FileText },
  { id: 4, name: "Banco", icon: Landmark },
  { id: 5, name: "Servicios", icon: Settings },
]

const countries = [
  { name: "Guatemala", code: "+502" },
  { name: "Panama", code: "+507" },
  { name: "Honduras", code: "+504" },
  { name: "El Salvador", code: "+503" },
  { name: "Costa Rica", code: "+506" },
]

const services = [
  { id: "api", label: "Documentacion API" },
  { id: "paymentLinks", label: "Links de Pago" },
  { id: "installments", label: "Habilitacion Cuotas" },
]

const guatemalaBanks = [
  "CRÉDITO HIPOTECARIO NACIONAL DE GUATEMALA",
  "BANCO CUSCATLÁN GUATEMALA S.A.",
  "BANCO DE LOS TRABAJADORES",
  "BANCO INDUSTRIAL S.A.",
  "BANCO DE DESARROLLO RURAL S.A.",
  "BANCO INTERNACIONAL S.A.",
  "CITIBANK N.A. SUCURSAL GUATEMALA",
  "VIVIBANCO S.A.",
  "BANCO FICOHSA GUATEMALA S.A.",
  "BANCO PROMERICA S.A.",
  "BANCO DE ANTIGUA S.A.",
  "BANCO DE AMÉRICA CENTRAL S.A.",
  "BANCO AGROMERCANTIL DE GUATEMALA S.A.",
  "BANCO G&T CONTINENTAL S.A.",
  "BANCO AZTECA DE GUATEMALA S.A.",
  "BANCO INV S.A.",
  "BANCO CREDICORP S.A.",
  "BANCO NEXA S.A.",
  "BANCO MULTIMONEY S.A.",
]

interface OnboardingFormProps {
  fullScreen?: boolean
}

export function OnboardingForm({ fullScreen = false }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [showAdditionalServices, setShowAdditionalServices] = useState(false)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
  if (isSuccess && !showThankYou) {
  const timer = setTimeout(() => {
  setShowThankYou(true)
  }, 5000) // 5 seconds to allow animation to complete
  return () => clearTimeout(timer)
  }
  }, [isSuccess, showThankYou])

  

  const [formData, setFormData] = useState({
    representativeName: "",
    idNumber: "",
    email: "",
    phoneCode: "",
    phoneNumber: "",
    businessName: "",
    logoFile: null as File | null,
    logoPreview: "",
    country: "",
    taxId: "",
    taxRegime: "",
    businessType: "",
    businessDescription: "",
    documentRTU: null as File | null,
    documentDPI: null as File | null,
    documentRecibo: null as File | null,
    documentPatente: null as File | null,
    bankAccount: "",
    accountType: "",
    bankName: "",
    selectedServices: ["paymentLinks"] as string[],
    documents: [] as File[], // Initialize documents array
  })

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCountryChange = (countryName: string) => {
    const country = countries.find((c) => c.name === countryName)
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      phoneCode: country?.code || "",
      bankName: "", // Clear bank when country changes
    }))
  }

  const toggleService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          logoFile: file,
          logoPreview: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoFile: null,
      logoPreview: "",
    }))
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: 'documentRTU' | 'documentDPI' | 'documentRecibo' | 'documentPatente') => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [docType]: file,
      }))
    }
  }

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }))
  }

  // Upload file to Vercel Blob
  const uploadFileToBlob = async (file: File, type: string): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        console.error('Upload failed:', response.statusText)
        return null
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.representativeName &&
          formData.idNumber &&
          formData.email &&
          formData.country &&
          formData.phoneNumber
        )
      case 2:
        return !!(
          formData.businessName &&
          formData.logoFile &&
          formData.taxId &&
          formData.taxRegime &&
          formData.businessType &&
          formData.businessDescription
        )
      case 3:
        return !!(formData.documentRTU && formData.documentDPI && formData.documentRecibo && formData.documentPatente)
      case 4:
        return !!(
          formData.bankAccount &&
          formData.accountType &&
          formData.bankName
        )
      case 5:
        return formData.selectedServices.length > 0
      default:
        return true
    }
  }

  const scrollToForm = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      setError("Por favor completa todos los campos obligatorios")
      return
    }
    setError(null)
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      scrollToForm()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      scrollToForm()
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      setError("Por favor selecciona al menos un servicio")
      return
    }
    setIsSubmitting(true)
    setError(null)

    try {
      const serviceLabels = formData.selectedServices.map(
        (id) => services.find((s) => s.id === id)?.label || ""
      )

      // Upload logo to Vercel Blob if exists
      let logoUrl = ""
      if (formData.logoFile) {
        const uploadedLogoUrl = await uploadFileToBlob(formData.logoFile, 'logo')
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl
        }
      }

      // Upload individual documents to Vercel Blob
      let documentRTUUrl = ""
      let documentDPIUrl = ""
      let documentReciboUrl = ""
      let documentPatenteUrl = ""

      if (formData.documentRTU) {
        const url = await uploadFileToBlob(formData.documentRTU, 'rtu')
        if (url) documentRTUUrl = url
      }
      if (formData.documentDPI) {
        const url = await uploadFileToBlob(formData.documentDPI, 'dpi')
        if (url) documentDPIUrl = url
      }
      if (formData.documentRecibo) {
        const url = await uploadFileToBlob(formData.documentRecibo, 'recibo')
        if (url) documentReciboUrl = url
      }
      if (formData.documentPatente) {
        const url = await uploadFileToBlob(formData.documentPatente, 'patente')
        if (url) documentPatenteUrl = url
      }

      const result = await submitOnboarding({
        representativeName: formData.representativeName,
        idNumber: formData.idNumber,
        email: formData.email,
        phone: `${formData.phoneCode} ${formData.phoneNumber}`,
        businessName: formData.businessName,
        logoUrl: logoUrl,
        country: formData.country,
        taxId: formData.taxId,
        taxRegime: formData.taxRegime,
        businessType: formData.businessType,
        businessDescription: formData.businessDescription,
        documentRTU: documentRTUUrl,
        documentDPI: documentDPIUrl,
        documentRecibo: documentReciboUrl,
        documentPatente: documentPatenteUrl,
        bankAccount: formData.bankAccount,
        accountType: formData.accountType,
        bankName: formData.bankName,
        services: serviceLabels,
      })

      if (result.success) {
        setIsSuccess(true)
      } else {
        setError(result.error || "Error al enviar el formulario")
      }
    } catch {
      setError("Error al enviar el formulario")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    if (!showThankYou) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
          <Script
            src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js"
            type="module"
          />
          <dotlottie-wc
            src="https://lottie.host/132624bb-b006-4c9a-a40c-ca70419089fd/KlaqWCgJX2.lottie"
            style={{ width: "300px", height: "300px" }}
            autoplay
          />
        </div>
      )
    }

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6 py-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
          Gracias, estás a nada de comenzar a recibir pagos de forma eficiente y segura
        </h3>
        <p className="max-w-md text-lg text-muted-foreground">
          Atento a tu bandeja de correo para recibir tus credenciales.
        </p>
      </div>
    )
  }

  return (
    <div className={`w-full ${fullScreen ? "flex flex-col" : ""}`}>
      {/* Header for mobile */}
      {fullScreen && (
        <div className="mb-4 text-center">
          <h2 className="text-lg font-bold text-foreground">
            {steps.find(s => s.id === currentStep)?.name}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Paso {currentStep} de {steps.length}
          </p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-1">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-background text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-6 sm:w-8 md:w-12 lg:w-16 ${
                      isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className={`${fullScreen ? "flex-1" : "min-h-[360px]"}`}>
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="mb-4 text-lg font-semibold">Representante Legal</h3>
            <div className="space-y-2">
              <Label htmlFor="representativeName">Nombre Completo *</Label>
              <Input
                id="representativeName"
                value={formData.representativeName}
                onChange={(e) =>
                  updateField("representativeName", e.target.value)
                }
                placeholder="Nombre del representante legal"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">Número de Identificación Personal *</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => updateField("idNumber", e.target.value)}
                placeholder="Documento de identificación"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electronico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="correo@ejemplo.com"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pais *</Label>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger id="country" className="h-12 w-full">
                  <SelectValue placeholder="Selecciona un pais" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono/WhatsApp *</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.phoneCode}
                  readOnly
                  className="h-12 w-20 bg-muted text-center"
                  placeholder="+000"
                />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  placeholder="0000 0000"
                  className="h-12 flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="mb-4 text-lg font-semibold">Datos del Negocio</h3>
            <div className="space-y-2">
              <Label htmlFor="businessName">
                Nombre Comercial / Razon Social *
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                placeholder="Nombre del negocio"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Logo del Comercio *</Label>
              {formData.logoPreview ? (
                <div className="relative flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5">
                  <img
                    src={formData.logoPreview || "/placeholder.svg"}
                    alt="Logo preview"
                    className="h-24 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5">
                  <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Haz clic para subir el logo
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    PNG, JPG hasta 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / Número ID Fiscal *</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => updateField("taxId", e.target.value)}
                placeholder="Número de identificación fiscal"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRegime">Régimen Tributario *</Label>
              <Select
                value={formData.taxRegime}
                onValueChange={(value) => updateField("taxRegime", value)}
              >
                <SelectTrigger id="taxRegime" className="h-12 w-full">
                  <SelectValue placeholder="Selecciona un régimen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Régimen Simplificado (Peq. Contribuyente)">
                    Régimen Simplificado (Peq. Contribuyente)
                  </SelectItem>
                  <SelectItem value="Régimen General">Régimen General</SelectItem>
                  <SelectItem value="Exento">Exento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Giro del Negocio *</Label>
              <Input
                id="businessType"
                value={formData.businessType}
                onChange={(e) => updateField("businessType", e.target.value)}
                placeholder="Tipo de negocio"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessDescription">
                Descripcion del Negocio *
              </Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) =>
                  updateField("businessDescription", e.target.value)
                }
                placeholder="Describe brevemente tu negocio"
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="mb-4 text-lg font-semibold">Documentación</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Sube los documentos requeridos para el proceso de onboarding.
            </p>
            
            {/* RTU */}
            <div className="space-y-2">
              <Label>RTU (Registro Tributario Unificado) *</Label>
              {formData.documentRTU ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">
                      {formData.documentRTU.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument('documentRTU')}
                    className="rounded-full p-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5">
                  <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Subir RTU</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleDocumentUpload(e, 'documentRTU')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* DPI */}
            <div className="space-y-2">
              <Label>Copia de DPI (ambos lados) *</Label>
              {formData.documentDPI ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">
                      {formData.documentDPI.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument('documentDPI')}
                    className="rounded-full p-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5">
                  <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Subir DPI</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleDocumentUpload(e, 'documentDPI')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Recibo de Luz o Agua */}
            <div className="space-y-2">
              <Label>Recibo de Luz o Agua *</Label>
              {formData.documentRecibo ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">
                      {formData.documentRecibo.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument('documentRecibo')}
                    className="rounded-full p-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5">
                  <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Subir Recibo</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleDocumentUpload(e, 'documentRecibo')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Patente de Comercio */}
            <div className="space-y-2">
              <Label>Patente de Comercio *</Label>
              {formData.documentPatente ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">
                      {formData.documentPatente.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument('documentPatente')}
                    className="rounded-full p-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5">
                  <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Subir Patente</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleDocumentUpload(e, 'documentPatente')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <p className="text-xs text-muted-foreground/70 italic">
              * Todos los documentos son obligatorios.
            </p>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5">
            <h3 className="mb-4 text-lg font-semibold">Datos Bancarios</h3>
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Numero de Cuenta *</Label>
              <Input
                id="bankAccount"
                value={formData.bankAccount}
                onChange={(e) => updateField("bankAccount", e.target.value)}
                placeholder="Número de cuenta bancaria"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de Cuenta *</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) => updateField("accountType", value)}
              >
                <SelectTrigger id="accountType" className="h-12 w-full">
                  <SelectValue placeholder="Selecciona tipo de cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monetaria">Monetaria</SelectItem>
                  <SelectItem value="Ahorro">Ahorro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Nombre de Banco *</Label>
              {formData.country === "Guatemala" ? (
                <Select
                  value={formData.bankName}
                  onValueChange={(value) => updateField("bankName", value)}
                >
                  <SelectTrigger id="bankName" className="h-12 w-full">
                    <SelectValue placeholder="Selecciona un banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {guatemalaBanks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => updateField("bankName", e.target.value)}
                  placeholder="Nombre del banco"
                  className="h-12"
                />
              )}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-5">
            <h3 className="mb-4 text-lg font-semibold">Servicios Solicitados</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Links de Pago está incluido por defecto
            </p>
            
            {/* Default Service - Links de Pago */}
            <div className="grid gap-3">
              <label
                className="flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors border-primary bg-primary/5"
              >
                <Checkbox
                  checked={true}
                  disabled
                />
                <span className="text-sm font-medium">Links de Pago</span>
                <span className="ml-auto text-xs text-primary font-medium">(Incluido)</span>
              </label>
            </div>

            {/* Button to show additional services */}
            {!showAdditionalServices ? (
              <Button
                type="button"
                onClick={() => setShowAdditionalServices(true)}
                className="w-full"
              >
                Elige otros servicios adicionales
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Servicios adicionales:</p>
                <div className="grid gap-3">
                  {services
                    .filter((service) => service.id !== "paymentLinks")
                    .map((service) => (
                      <label
                        key={service.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                          formData.selectedServices.includes(service.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={formData.selectedServices.includes(service.id)}
                          onCheckedChange={() => toggleService(service.id)}
                        />
                        <span className="text-sm font-medium">{service.label}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {currentStep < 5 ? (
          <Button type="button" onClick={nextStep} className="gap-2">
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Solicitud"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
