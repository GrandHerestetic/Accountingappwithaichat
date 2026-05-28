export type ProfileRole = "client" | "executor" | "coach" | "admin"

const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  "1-2": "Опыт 1–2 года",
  "3-5": "Опыт 3–5 лет",
  "6-10": "Опыт 6–10 лет",
  "10+": "Опыт более 10 лет",
  mid: "Средний уровень",
  junior: "Начинающий",
  senior: "Старший специалист",
}

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

function parseExpertiseField(expertise: unknown): string[] {
  return parseProfileSpecializations(expertise)
}

export function formatExperienceLevel(level: unknown): string {
  const key = String(level ?? "").trim()
  if (!key) return ""
  return EXPERIENCE_LEVEL_LABELS[key] ?? key
}

/** Специализации для отображения по роли. */
export function getProfileSpecializationsForDisplay(
  profile: Record<string, unknown>,
  role?: string
): string[] {
  if (role === "client") {
    const position = String(profile.contact_position ?? "").trim()
    return position ? [position] : []
  }

  if (role === "coach") {
    return parseExpertiseField(profile.expertise)
  }

  if (role === "executor") {
    return parseProfileSpecializations(profile.specializations)
  }

  const specs = parseProfileSpecializations(profile.specializations)
  if (specs.length > 0) return specs
  return parseExpertiseField(profile.expertise)
}

/** Подзаголовок под именем в профиле. */
export function getProfileTitle(profile: Record<string, unknown>, role?: string): string {
  const specs = getProfileSpecializationsForDisplay(profile, role)
  if (specs.length > 0) return specs[0]

  if (role === "client") {
    return String(profile.company_name ?? profile.contact_name ?? "").trim()
  }

  if (role === "executor") {
    return formatExperienceLevel(profile.experience_level)
  }

  if (role === "coach") {
    return String(profile.expertise ?? "").trim()
  }

  return ""
}
