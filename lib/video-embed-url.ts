/**
 * Преобразует ссылку YouTube/Vimeo в URL для встраивания через iframe.
 * Обычные watch-ссылки YouTube в iframe не воспроизводятся.
 */
export function toVideoEmbedUrl(raw: string): string | null {
  const input = raw.trim()
  if (!input) return null

  try {
    const parsed = new URL(input.includes("://") ? input : `https://${input}`)
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase()

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v")
        if (id) return `https://www.youtube.com/embed/${id}`
      }
      const embedMatch = parsed.pathname.match(/^\/embed\/([^/?]+)/)
      if (embedMatch?.[1]) return `https://www.youtube.com/embed/${embedMatch[1]}`
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/)
      if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`
    }

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`
    }

    if (host === "player.vimeo.com") {
      return parsed.toString()
    }

    return null
  } catch {
    return null
  }
}

/** URL для сохранения и отображения видео-материала. */
export function normalizeVideoMaterialUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  return toVideoEmbedUrl(trimmed) ?? trimmed
}

export function isLikelyVideoHost(url: string): boolean {
  const lower = url.toLowerCase()
  return (
    lower.includes("youtube") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo")
  )
}
