"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useAuth } from "@/components/auth-provider"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()

  // Don't render layout on login page
  if (pathname === "/login") {
    return <>{children}</>
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-400 mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render the layout if authenticated
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    )
  }

  // Fallback, should not reach here due to redirects in AuthProvider
  return <>{children}</>
}
