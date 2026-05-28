import type { OrderResponse } from "@/lib/api/types"

const DEADLINE_MARKER = "Предлагаемый срок:"

function extractDeadlineFromCoverLetter(coverLetter?: string): string | null {
  const text = (coverLetter ?? "").trim()
  if (!text) return null
  const idx = text.lastIndexOf(DEADLINE_MARKER)
  if (idx === -1) return null
  const raw = text.slice(idx + DEADLINE_MARKER.length).trim()
  return raw || null
}

function formatDateSafe(raw: string): string {
  const value = raw.trim()
  if (!value) return value

  // For YYYY-MM-DD we force UTC to avoid timezone day-shifts.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00.000Z`)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("ru-RU", { timeZone: "UTC" })
    }
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("ru-RU")
  }
  return value
}

export function getResponseDeadlineLabel(response: Pick<OrderResponse, "proposed_deadline" | "cover_letter">): string | null {
  const raw = response.proposed_deadline?.trim() || extractDeadlineFromCoverLetter(response.cover_letter)
  if (!raw) return null
  return formatDateSafe(raw)
}
