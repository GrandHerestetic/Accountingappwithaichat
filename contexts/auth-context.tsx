"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { refreshAccessToken } from "@/lib/api-client"
import { clearPersistedTokens, extractTokenPair, persistTokens } from "@/lib/auth-tokens"
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister } from "@/lib/api"
import type { LoginRequest, RegisterRequest, UserProfile } from "@/lib/api/types"
import { ApiError } from "@/lib/api/types"

/** Access JWT ~15 min — обновляем чуть раньше истечения */
const PROACTIVE_REFRESH_MS = 12 * 60 * 1000

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const profile = await getMe()
    setUser(profile)
    setIsAuthenticated(true)
  }, [])

  const silentRefresh = useCallback(async () => {
    if (typeof window === "undefined") return
    if (!localStorage.getItem("refresh_token")) return

    const result = await refreshAccessToken()
    if (result.ok) {
      try {
        await refreshUser()
      } catch {
        // access валиден — не сбрасываем сессию из-за временной ошибки /me
      }
    } else if (result.reason === "auth" || result.reason === "no_refresh_token") {
      clearPersistedTokens()
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [refreshUser])

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null)
      setIsAuthenticated(false)
    }
    window.addEventListener("auth:session-expired", onSessionExpired)
    return () => window.removeEventListener("auth:session-expired", onSessionExpired)
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedRefreshToken =
          typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

        if (!storedRefreshToken) return

        const result = await refreshAccessToken()
        if (!result.ok) {
          if (result.reason === "auth" || result.reason === "no_refresh_token") {
            clearPersistedTokens()
          }
          return
        }

        try {
          await refreshUser()
        } catch (error) {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            clearPersistedTokens()
            setIsAuthenticated(false)
            setUser(null)
          }
          // сеть / 5xx — токены оставляем, пользователь остаётся «полуавторизован» до следующего запроса
        }
      } catch (error) {
        console.error("Error restoring auth session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [refreshUser])

  useEffect(() => {
    const interval = setInterval(() => {
      void silentRefresh()
    }, PROACTIVE_REFRESH_MS)

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void silentRefresh()
      }
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [silentRefresh])

  const login = async (credentials: LoginRequest): Promise<void> => {
    const auth = await apiLogin(credentials)
    const tokens = extractTokenPair(auth)
    if (!tokens) {
      throw new Error("Сервер не вернул токены авторизации")
    }

    persistTokens(tokens)
    await refreshUser()
    setIsLoading(false)
  }

  const logout = async (): Promise<void> => {
    const storedRefreshToken =
      typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

    try {
      await apiLogout(storedRefreshToken)
    } catch (error) {
      console.error("Logout request error:", error)
    } finally {
      clearPersistedTokens()
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const register = async (payload: RegisterRequest): Promise<void> => {
    const auth = await apiRegister(payload)
    const tokens = extractTokenPair(auth)
    if (!tokens) {
      throw new Error("Сервер не вернул токены авторизации")
    }

    persistTokens(tokens)
    await refreshUser()
    setIsLoading(false)
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
