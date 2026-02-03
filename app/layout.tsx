import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'MIGO Onboarding',
  description: 'Completa tu proceso de onboarding con MIGO y comienza a recibir pagos de forma segura y eficiente.',
  generator: 'v0.app',
  openGraph: {
    title: 'MIGO Onboarding',
    description: 'Completa tu proceso de onboarding con MIGO y comienza a recibir pagos de forma segura y eficiente.',
    images: [
      {
        url: 'https://i.ibb.co/RktMz6WJ/Texto-del-pa-rrafo-19.png',
        width: 1200,
        height: 630,
        alt: 'MIGO Onboarding',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MIGO Onboarding',
    description: 'Completa tu proceso de onboarding con MIGO y comienza a recibir pagos de forma segura y eficiente.',
    images: ['https://i.ibb.co/RktMz6WJ/Texto-del-pa-rrafo-19.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
