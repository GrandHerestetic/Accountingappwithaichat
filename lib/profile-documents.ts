import { resolveUploadUrl } from "@/lib/upload-url"

export const PROFILE_DOC_KIND_PORTFOLIO = "portfolio"
export const PROFILE_DOC_KIND_ACHIEVEMENT = "achievement"

export type ProfileDocKind = typeof PROFILE_DOC_KIND_PORTFOLIO | typeof PROFILE_DOC_KIND_ACHIEVEMENT

export type ProfileDocItem = {
  id: string
  upload_id: string
  url: string
  original_name: string
  mime_type: string
  kind: ProfileDocKind
  caption?: string
  title?: string
  description?: string
  created_at: string
}

type RawProfileDocument = {
  id?: string
  upload_id?: string
  url?: string
  original_name?: string
  mime_type?: string
  metadata?: Record<string, unknown>
  created_at?: string
}

export function parseProfileDocument(raw: RawProfileDocument): ProfileDocItem | null {
  if (!raw.id) return null
  const meta = raw.metadata ?? {}
  const kindRaw = String(meta.kind ?? "")
  const kind: ProfileDocKind =
    kindRaw === PROFILE_DOC_KIND_PORTFOLIO
      ? PROFILE_DOC_KIND_PORTFOLIO
      : PROFILE_DOC_KIND_ACHIEVEMENT

  return {
    id: raw.id,
    upload_id: String(raw.upload_id ?? ""),
    url: resolveUploadUrl(raw.url),
    original_name: String(raw.original_name ?? "file"),
    mime_type: String(raw.mime_type ?? "application/octet-stream"),
    kind,
    caption: meta.caption != null ? String(meta.caption) : undefined,
    title: meta.title != null ? String(meta.title) : undefined,
    description: meta.description != null ? String(meta.description) : undefined,
    created_at: String(raw.created_at ?? new Date().toISOString()),
  }
}

export function parseProfileDocuments(raw: unknown): ProfileDocItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => parseProfileDocument(item as RawProfileDocument))
    .filter((item): item is ProfileDocItem => item !== null)
}

export function filterProfileDocuments(items: ProfileDocItem[], kind: ProfileDocKind): ProfileDocItem[] {
  return items.filter((item) => item.kind === kind)
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/")
}
