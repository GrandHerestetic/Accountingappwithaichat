/** Превращает путь из API в URL для <img src> (через Next rewrite /uploads). */
export function resolveUploadUrl(url?: string | null): string {
  if (!url?.trim()) return ""
  const trimmed = url.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed
  if (trimmed.startsWith("/")) return trimmed
  return `/uploads/${trimmed.replace(/^\/+/, "")}`
}
