import { extractTokenPair } from "./auth-tokens"
import { ApiError, ApiErrorResponse } from "./api/types"

// ---------------------------------------------------------------------------
// Base URL — empty string means relative URLs (same origin), which works for
// Next.js API routes and a co-located backend. Override via env var.
// ---------------------------------------------------------------------------
/** В браузере — относительные URL (Next rewrites → бэкенд). На сервере — прямой URL. */
const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080")

const ACCESS_TOKEN_SESSION_KEY = "access_token"
const REFRESH_MAX_ATTEMPTS = 3
const REFRESH_RETRY_DELAYS_MS = [0, 1000, 2000]

export type RefreshResult =
  | { ok: true; accessToken: string }
  | { ok: false; reason: "no_refresh_token" | "auth" | "network" | "invalid_response" }

// ---------------------------------------------------------------------------
// Access token: in-memory + sessionStorage (per-tab, survives HMR/reload)
// ---------------------------------------------------------------------------
function readStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const t = sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY)
    return t && t !== "undefined" ? t : null
  } catch {
    return null
  }
}

let accessToken: string | null = readStoredAccessToken()

export function setAccessToken(token: string | null): void {
  accessToken = token
  if (typeof window === "undefined") return
  try {
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_SESSION_KEY, token)
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY)
    }
  } catch {
    // private browsing / quota
  }
}

export function getAccessToken(): string | null {
  return accessToken
}

// ---------------------------------------------------------------------------
// Session expiry — AuthProvider listens and clears UI state
// ---------------------------------------------------------------------------
export function notifySessionExpired(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("refresh_token")
  setAccessToken(null)
  window.dispatchEvent(new CustomEvent("auth:session-expired"))
  if (!window.location.pathname.startsWith("/auth/")) {
    window.location.href = "/auth/login"
  }
}

function handleRefreshFailure(result: RefreshResult): void {
  if (result.ok) return
  if (result.reason === "auth" || result.reason === "no_refresh_token") {
    notifySessionExpired()
  }
}

// ---------------------------------------------------------------------------
// Token refresh with deduplication + retries on transient errors
// ---------------------------------------------------------------------------
let refreshPromise: Promise<RefreshResult> | null = null

async function postRefresh(refreshToken: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function refreshAccessToken(): Promise<RefreshResult> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async (): Promise<RefreshResult> => {
    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null

      if (!refreshToken) {
        return { ok: false, reason: "no_refresh_token" }
      }

      let lastStatus: number | null = null

      for (let attempt = 0; attempt < REFRESH_MAX_ATTEMPTS; attempt++) {
        const delay = REFRESH_RETRY_DELAYS_MS[attempt] ?? 2000
        if (delay > 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, delay))
        }

        try {
          const response = await postRefresh(refreshToken)
          lastStatus = response.status

          if (response.ok) {
            const data = await response.json()
            const tokens = extractTokenPair(data)
            if (!tokens) {
              return { ok: false, reason: "invalid_response" }
            }
            setAccessToken(tokens.access_token)
            if (typeof window !== "undefined") {
              localStorage.setItem("refresh_token", tokens.refresh_token)
            }
            return { ok: true, accessToken: tokens.access_token }
          }

          if (response.status === 401 || response.status === 403) {
            return { ok: false, reason: "auth" }
          }

          // 5xx / 429 — retry
          if (response.status >= 500 || response.status === 429) {
            continue
          }

          return { ok: false, reason: "auth" }
        } catch {
          // network error — retry
        }
      }

      if (lastStatus !== null && lastStatus >= 500) {
        return { ok: false, reason: "network" }
      }
      return { ok: false, reason: "network" }
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/** Обновить access token до запроса, если есть refresh, но access потерян/истёк. */
export async function ensureAccessToken(): Promise<RefreshResult | null> {
  if (getAccessToken()) return null
  if (typeof window === "undefined") return null
  if (!localStorage.getItem("refresh_token")) return null
  return refreshAccessToken()
}

// ---------------------------------------------------------------------------
// Helper: build headers with optional Authorization
// ---------------------------------------------------------------------------
function buildHeaders(init?: RequestInit, json = true): HeadersInit {
  const raw = getAccessToken()
  const token = raw && raw !== "undefined" ? raw : null
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  if (json && !(init?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status >= 400) {
    await throwApiError(response)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

async function retryAfterUnauthorized(
  doFetch: () => Promise<Response>
): Promise<Response> {
  const refresh = await refreshAccessToken()

  if (!refresh.ok) {
    handleRefreshFailure(refresh)
    const probe = await doFetch()
    if (probe.status !== 401) {
      return probe
    }
    await throwApiError(probe)
  }

  const retryResponse = await doFetch()

  if (retryResponse.status === 401) {
    notifySessionExpired()
    await throwApiError(retryResponse)
  }

  return retryResponse
}

/** Multipart/form-data (file uploads). Do not set Content-Type manually. */
export async function apiFormRequest<T>(
  path: string,
  formData: FormData,
  init?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const method = init?.method ?? "POST"

  const doFetch = () =>
    fetch(url, {
      ...init,
      method,
      headers: buildHeaders(init, false),
      body: formData,
    })

  if (typeof window !== "undefined") {
    const pre = await ensureAccessToken()
    if (pre && !pre.ok) {
      handleRefreshFailure(pre)
    }
  }

  let response = await doFetch()

  if (response.status === 401) {
    response = await retryAfterUnauthorized(doFetch)
  }

  return handleResponse<T>(response)
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

  if (typeof window !== "undefined") {
    const pre = await ensureAccessToken()
    if (pre && !pre.ok) {
      handleRefreshFailure(pre)
    }
  }

  const doFetch = () =>
    fetch(url, {
      ...init,
      headers: buildHeaders(init),
    })

  // --- Attempt the request, retrying once after 2 s on network error ---
  let response: Response
  try {
    response = await doFetch()
  } catch {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
    response = await doFetch()
  }

  if (response.status === 401) {
    response = await retryAfterUnauthorized(doFetch)
  }

  return handleResponse<T>(response)
}
