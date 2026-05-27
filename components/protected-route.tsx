"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Array<"client" | "executor" | "coach" | "admin">
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/auth/login" }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (user && !allowedRoles.includes(user.role)) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, allowedRoles, router, redirectTo, isLoading])

  // Session restore can lag behind a fresh login — don't block UI when already authenticated.
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
