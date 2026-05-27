const RETURN_PATH_KEY = "payment_return_path"

export function savePaymentReturnPath(path?: string) {
  if (typeof window === "undefined") return
  const target = path ?? `${window.location.pathname}${window.location.search}`
  sessionStorage.setItem(RETURN_PATH_KEY, target)
}

export function consumePaymentReturnPath(fallback = "/"): string {
  if (typeof window === "undefined") return fallback
  const saved = sessionStorage.getItem(RETURN_PATH_KEY)
  sessionStorage.removeItem(RETURN_PATH_KEY)
  return saved && saved.startsWith("/") ? saved : fallback
}

/** Redirect in the same tab (required for Kaspi / mobile deep links). */
export function redirectToCheckout(checkoutUrl: string, returnPath?: string): void {
  savePaymentReturnPath(returnPath)
  window.location.href = checkoutUrl
}
