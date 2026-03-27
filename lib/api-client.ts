import { ApiError, ApiErrorResponse } from "./api/types"

// ---------------------------------------------------------------------------
// Base URL — empty string means relative URLs (same origin), which works for
// Next.js API routes and a co-located backend. Override via env var.
// ---------------------------------------------------------------------------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

// ---------------------------------------------------------------------------
// Module-level access token (in-memory only — never persisted to localStorage)
// ---------------------------------------------------------------------------
let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

// ---------------------------------------------------------------------------
// Token refresh with deduplication
// Concurrent callers all await the same in-flight promise so we never send
// more than one refresh request at a time.
// ---------------------------------------------------------------------------
let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async (): Promise<string | null> => {
    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null

      if (!refreshToken) {
        return null
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        return null
      }

      const data = (await response.json()) as { access_token?: string }
      const newToken = data.access_token ?? null
      setAccessToken(newToken)
      return newToken
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ---------------------------------------------------------------------------
// Helper: build headers with optional Authorization
// ---------------------------------------------------------------------------
function buildHeaders(init?: RequestInit): HeadersInit {
  const token = getAccessToken()
  return {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ---------------------------------------------------------------------------
// Helper: parse a >= 400 response into an ApiError and throw it
// ---------------------------------------------------------------------------
async function throwApiError(response: Response): Promise<never> {
  let payload: ApiErrorResponse | null = null

  try {
    payload = (await response.json()) as ApiErrorResponse
  } catch {
    payload = null
  }

  const message =
    payload?.error?.message ?? `Request failed with status ${response.status}`
  const code = payload?.error?.code
  const requestId = payload?.error?.request_id

  throw new ApiError(message, response.status, code, requestId)
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------
export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`

  // --- Attempt the request, retrying once after 2 s on network error ---
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      headers: buildHeaders(init),
    })
  } catch {
    // Network error — wait 2 s then retry once
    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
    response = await fetch(url, {
      ...init,
      headers: buildHeaders(init),
    })
    // If this second attempt also throws, the error propagates to the caller.
  }

  // --- Handle 401: attempt token refresh exactly once, then retry ---
  if (response.status === 401) {
    const newToken = await refreshAccessToken()

    if (!newToken) {
      // Refresh failed — clear auth state and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("refresh_token")
        setAccessToken(null)
        window.location.href = "/auth/login"
      }
      await throwApiError(response)
    }

    // Retry the original request with the new token
    const retryResponse = await fetch(url, {
      ...init,
      headers: buildHeaders(init),
    })

    if (retryResponse.status === 401) {
      // Refresh token itself is invalid — clear auth state and redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("refresh_token")
        setAccessToken(null)
        window.location.href = "/auth/login"
      }
      await throwApiError(retryResponse)
    }

    response = retryResponse
  }

  // --- Handle all other 4xx / 5xx responses ---
  if (response.status >= 400) {
    await throwApiError(response)
  }

  // --- Success ---
  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
