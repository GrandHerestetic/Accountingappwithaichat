"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { setAccessToken } from "@/lib/api-client"
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister } from "@/lib/api"
import type { LoginRequest, RegisterRequest, UserProfile } from "@/lib/api/types"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function storeTokens(tokens: { access_token: string; refresh_token: string }) {
  setAccessToken(tokens.access_token)
  if (typeof window !== "undefined") {
    localStorage.setItem("refresh_token", tokens.refresh_token)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    const profile = await getMe()
    setUser(profile)
    setIsAuthenticated(true)
  }

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedRefreshToken =
          typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

        if (!storedRefreshToken) return

        try {
          await refreshUser()
        } catch {
          if (typeof window !== "undefined") {
            localStorage.removeItem("refresh_token")
          }
          setAccessToken(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error restoring auth session:", error)
        if (typeof window !== "undefined") {
          localStorage.removeItem("refresh_token")
        }
        setAccessToken(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    const auth = await apiLogin(credentials)

    storeTokens(auth.tokens)
    await refreshUser()
  }

  const logout = async (): Promise<void> => {
    const storedRefreshToken =
      typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

    try {
      await apiLogout(storedRefreshToken)
    } catch (error) {
      console.error("Logout request error:", error)
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("refresh_token")
      }
      setAccessToken(null)
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const register = async (payload: RegisterRequest): Promise<void> => {
    const auth = await apiRegister(payload)

    storeTokens(auth.tokens)
    await refreshUser()
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, register, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
