"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiRequest, setAccessToken } from "@/lib/api-client"
import type { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from "@/lib/api/types"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch the current user profile from /api/v1/auth/me
  const fetchCurrentUser = async (): Promise<UserProfile> => {
    return apiRequest<UserProfile>("/api/v1/auth/me", { method: "GET" })
  }

  // Restore session on mount by checking localStorage for refresh_token
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedRefreshToken =
          typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

        if (!storedRefreshToken) {
          return
        }

        // We have a refresh token — try to restore the session via /api/v1/auth/me.
        // The api-client will automatically attempt a token refresh if the access token
        // is missing/expired (401 → refresh → retry cycle).
        try {
          const profile = await fetchCurrentUser()
          setUser(profile)
          setIsAuthenticated(true)
        } catch {
          // /api/v1/auth/me returned 401 or a network error — clear stored token
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

  /**
   * Login: POST /api/v1/auth/login
   * On success: store access token in memory, refresh token in localStorage,
   * then fetch and store the user profile.
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    const auth = await apiRequest<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    // Store access token in memory only
    setAccessToken(auth.access_token)

    // Store refresh token in localStorage under key "refresh_token"
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", auth.refresh_token)
    }

    // Fetch and store the complete user profile
    const profile = await fetchCurrentUser()
    setUser(profile)
    setIsAuthenticated(true)
  }

  /**
   * Logout: POST /api/v1/auth/logout with { refresh_token }
   * Regardless of result: remove refresh_token from localStorage,
   * clear in-memory access token, and clear user state.
   */
  const logout = async (): Promise<void> => {
    const storedRefreshToken =
      typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

    try {
      await apiRequest<void>("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      })
    } catch (error) {
      console.error("Logout request error:", error)
    } finally {
      // Always clear auth state regardless of logout request result
      if (typeof window !== "undefined") {
        localStorage.removeItem("refresh_token")
      }
      setAccessToken(null)
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  /**
   * Register: POST /api/v1/auth/register
   * On success (HTTP 201): store tokens same as login, fetch user profile.
   */
  const register = async (payload: RegisterRequest): Promise<void> => {
    const auth = await apiRequest<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    // Store access token in memory only
    setAccessToken(auth.access_token)

    // Store refresh token in localStorage under key "refresh_token"
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", auth.refresh_token)
    }

    // Fetch and store the complete user profile
    const profile = await fetchCurrentUser()
    setUser(profile)
    setIsAuthenticated(true)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
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
