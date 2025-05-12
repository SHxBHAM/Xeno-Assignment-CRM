"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useSearchParams } from "next/navigation"

type AuthContextType = {
  user: { name?: string; email?: string; image?: string } | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ user: null, isAuthenticated: false, isLoading: true, login: () => {}, logout: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const isLoading = status === "loading"
  const user = session?.user || null
  const isAuthenticated = !!user

  const login = () => {
    const callbackUrl = searchParams.get("callbackUrl") || "/"
    signIn("google", { callbackUrl })
  }

  const logout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
