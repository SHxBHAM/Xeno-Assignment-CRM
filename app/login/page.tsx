"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

function LoginContent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      const callbackUrl = searchParams.get("callbackUrl") || "/"
      router.push(callbackUrl)
    }
  }, [isAuthenticated, router, searchParams])

  const handleLogin = () => {
    const callbackUrl = searchParams.get("callbackUrl") || "/"
    login()
  }

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Xeno CRM Platform</CardTitle>
        <CardDescription>Sign in to access your CRM dashboard</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Sign in with</span>
          </div>
        </div>
        {isLoading ? (
          <p>Loading…</p>
        ) : isAuthenticated ? (
          <div>
            <p>Signed in as {user?.email}.</p>
            <button onClick={logout}>Sign out</button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handleLogin}
            className="flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
            </svg>
            Sign in with Google
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs text-center text-muted-foreground mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  )
}

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <Suspense fallback={
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <LoginContent />
      </Suspense>
    </div>
  )
}
