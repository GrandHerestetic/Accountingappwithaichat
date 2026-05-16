import { setAccessToken } from "@/lib/api-client"
import type { TokenPair } from "@/lib/api/types"

/** Поддержка `{ tokens: { ... } }` и плоского `{ access_token, refresh_token }`. */
export function extractTokenPair(data: unknown): TokenPair | null {
  if (!data || typeof data !== "object") return null

  const root = data as Record<string, unknown>
  const nested = root.tokens

  if (nested && typeof nested === "object") {
    const t = nested as Record<string, unknown>
    if (typeof t.access_token === "string" && t.access_token && typeof t.refresh_token === "string") {
      return { access_token: t.access_token, refresh_token: t.refresh_token }
    }
  }

  if (typeof root.access_token === "string" && root.access_token && typeof root.refresh_token === "string") {
    return { access_token: root.access_token, refresh_token: root.refresh_token }
  }

  return null
}

export function persistTokens(tokens: TokenPair): void {
  if (!tokens.access_token?.trim()) {
    throw new Error("Сервер не вернул access token")
  }
  setAccessToken(tokens.access_token)
  if (typeof window !== "undefined") {
    localStorage.setItem("refresh_token", tokens.refresh_token)
  }
}

export function clearPersistedTokens(): void {
  setAccessToken(null)
  if (typeof window !== "undefined") {
    localStorage.removeItem("refresh_token")
  }
}
