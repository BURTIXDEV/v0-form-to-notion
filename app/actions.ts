"use server"

import { Client } from "@notionhq/client"

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const DATABASE_ID = "2fcce918f4fb80579898c5b9dd26b3b3"

// Zendesk configuration
const ZENDESK_SUBDOMAIN = "migopaymentssupport"
const ZENDESK_EMAIL = process.env.ZENDESK_EMAIL || "support@migopaymentssupport.zendesk.com"
const ZENDESK_API_KEY = process.env.ZENDESK_API_KEY

interface OnboardingData {
  representativeName: string
  idNumber: string
  email: string
  phone: string
  businessName: string
  logoUrl: string
  country: string
  taxId: string
  taxRegime: string
  businessType: string
  businessDescription: string
  documents: string
  bankAccount: string
  accountType: string
  bankName: string
  services: string[]
}

async function createZendeskTicket(data: OnboardingData) {
  if (!ZENDESK_API_KEY) {
    console.error("Zendesk API key not configured")
    return { success: false, error: "Zendesk API key not configured" }
  }

  const ticketBody = `
Nueva solicitud de onboarding de comercio:

=== INFORMACIÓN DEL REPRESENTANTE ===
Nombre: ${data.representativeName}
Número de ID: ${data.idNumber}
Email: ${data.email}
Teléfono: ${data.phone}

=== INFORMACIÓN DEL NEGOCIO ===
Nombre del Negocio: ${data.businessName}
País: ${data.country}
NIT/Tax ID: ${data.taxId}
Régimen Tributario: ${data.taxRegime}
Tipo de Negocio: ${data.businessType}
Descripción: ${data.businessDescription}

=== INFORMACIÓN BANCARIA ===
Cuenta Bancaria: ${data.bankAccount}
Tipo de Cuenta: ${data.accountType}
Banco: ${data.bankName}

=== SERVICIOS SOLICITADOS ===
${data.services?.join(", ") || "Ninguno seleccionado"}

=== DOCUMENTOS ===
${data.documents || "No especificados"}
  `.trim()

  const ticketData = {
    ticket: {
      subject: `Onboarding Comercio: ${data.businessName}`,
      comment: {
        body: ticketBody,
      },
      requester: {
        name: data.representativeName,
        email: data.email,
      },
      priority: "normal",
      tags: ["onboarding", "nuevo-comercio", data.country?.toLowerCase() || "sin-pais"],
    },
  }

  try {
    const credentials = Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_KEY}`).toString("base64")
    
    const response = await fetch(`https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(ticketData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Zendesk API error:", errorText)
      return { success: false, error: `Zendesk error: ${response.status}` }
    }

    const result = await response.json()
    return { success: true, ticketId: result.ticket?.id }
  } catch (error) {
    console.error("Error creating Zendesk ticket:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function submitOnboarding(data: OnboardingData) {
  try {
    const properties: Record<string, unknown> = {
      "Nombre Representante": {
        title: [
          {
            text: {
              content: data.representativeName,
            },
          },
        ],
      },
      "ID Number": {
        rich_text: [
          {
            text: {
              content: data.idNumber,
            },
          },
        ],
      },
      Email: {
        email: data.email || null,
      },
      Phone: {
        phone_number: data.phone || null,
      },
      "Business Name": {
        rich_text: [
          {
            text: {
              content: data.businessName,
            },
          },
        ],
      },
      "Tax ID": {
        rich_text: [
          {
            text: {
              content: data.taxId,
            },
          },
        ],
      },
      "Tax Regime": data.taxRegime ? {
        select: {
          name: data.taxRegime,
        },
      } : undefined,
      "Business Type": data.businessType ? {
        select: {
          name: data.businessType,
        },
      } : undefined,
      "Business Description": {
        rich_text: [
          {
            text: {
              content: data.businessDescription,
            },
          },
        ],
      },
      "Bank Account": {
        rich_text: [
          {
            text: {
              content: data.bankAccount,
            },
          },
        ],
      },
      "Bank Name": data.bankName ? {
        select: {
          name: data.bankName,
        },
      } : undefined,
      Status: {
        select: {
          name: "Pending Review",
        },
      },
    }

    // Add country if provided
    if (data.country) {
      properties["Country"] = {
        select: {
          name: data.country,
        },
      }
    }

    // Add account type if provided
    if (data.accountType) {
      properties["Account Type"] = {
        select: {
          name: data.accountType,
        },
      }
    }

    // Add services if any selected
    if (data.services && data.services.length > 0) {
      properties["Servicios Solicitados"] = {
        multi_select: data.services.map((service) => ({ name: service })),
      }
    }

    // Add logo URL if provided - files type expects external URLs
    if (data.logoUrl && !data.logoUrl.startsWith("data:")) {
      properties["Logo URL"] = {
        files: [
          {
            type: "external",
            name: "Logo",
            external: {
              url: data.logoUrl,
            },
          },
        ],
      }
    }
    
    // Add documents list - files type (supports multiple URLs separated by comma)
    if (data.documents) {
      const documentUrls = data.documents.split(",").filter(url => url.trim() && !url.startsWith("data:"))
      if (documentUrls.length > 0) {
        properties["Documents"] = {
          files: documentUrls.map((url, index) => ({
            type: "external",
            name: `Document ${index + 1}`,
            external: {
              url: url.trim(),
            },
          })),
        }
      }
    }

    await notion.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      properties: properties as Parameters<
        typeof notion.pages.create
      >[0]["properties"],
    })

    // Also create a Zendesk ticket
    const zendeskResult = await createZendeskTicket(data)
    if (!zendeskResult.success) {
      console.error("Zendesk ticket creation failed:", zendeskResult.error)
      // We don't fail the whole submission if Zendesk fails, just log it
    }

    return { success: true, zendeskTicketId: zendeskResult.ticketId }
  } catch (error) {
    console.error("Error submitting to Notion:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al enviar el formulario",
    }
  }
}
