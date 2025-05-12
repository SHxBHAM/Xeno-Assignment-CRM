"use client"

import { createContext, useContext, type ReactNode, Suspense } from "react"
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

function AuthProviderContent({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const isLoading = status === "loading"
  const user = session?.user || null
  const isAuthenticated = !!user

  const login = () => {
    // Get the callback URL from the search params, default to dashboard
    const callbackUrl = searchParams.get("callbackUrl") || "/campaigns"
    signIn("google", { 
      callbackUrl,
      redirect: true,
    })
  }

  const logout = () => {
    signOut({ 
      callbackUrl: "/login",
      redirect: true,
    })
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  )
}

export const useAuth = () => useContext(AuthContext)
