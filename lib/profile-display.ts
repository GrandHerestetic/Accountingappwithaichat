export function parseProfileSpecializations(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).map((s) => s.trim()).filter(Boolean)
  }
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim()
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown
        if (Array.isArray(parsed)) {
          return parsed.map(String).map((s) => s.trim()).filter(Boolean)
        }
      } catch {
        // fall through to comma split
      }
    }
    return trimmed
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

/** Специализации для отображения: массив из API + fallback на experience_level / expertise. */
export function getProfileSpecializationsForDisplay(
  profile: Record<string, unknown>,
  role?: string
): string[] {
  const specs = parseProfileSpecializations(profile.specializations)
  if (specs.length > 0) return specs

  const fallback = String(
    profile.experience_level ?? profile.expertise ?? profile.title ?? ""
  ).trim()
  if (!fallback || fallback === "Специалист") return []

  if (role === "coach" || role === "executor") {
    return [fallback]
  }
  return []
}

export function getProfileTitle(profile: Record<string, unknown>): string {
  const level = String(profile.experience_level ?? profile.expertise ?? "").trim()
  if (level) return level
  const specs = parseProfileSpecializations(profile.specializations)
  return specs[0] ?? ""
}
