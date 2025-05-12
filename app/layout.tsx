/* Remove "use client" and export metadata; this file is a server component */

import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import ClientProviders from "@/components/client-providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Xeno CRM Platform",
  description: "A modern CRM platform for customer segmentation and campaign management",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
