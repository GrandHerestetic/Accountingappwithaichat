/** Поля PATCH /api/v1/profile (см. backend profile.UpdateProfileRequest). */
export type ProfileRole = "client" | "executor" | "coach" | "admin"

export type ProfilePatchInput = {
  profile_name?: string
  /** Алиас для profile_name (старые формы). */
  display_name?: string
  phone?: string
  about?: string
  bio?: string
  company_name?: string
  contact_name?: string
  website?: string
  /** Город (исполнитель) или алиас для address (клиент). */
  city?: string
  /** Местоположение из UI — маппится в city или address по роли. */
  location?: string
  address?: string
  expertise?: string
  experience_level?: string
  specializations?: string[]
  /** Строка «Налоги, 1С» — разбивается в specializations. */
  specializations_text?: string
}

function parseSpecializations(input: ProfilePatchInput): string[] | undefined {
  if (input.specializations?.length) {
    return input.specializations.map((s) => s.trim()).filter(Boolean)
  }
  const text = input.specializations_text?.trim()
  if (!text) return undefined
  const items = text
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length ? items : undefined
}

export function serializeProfilePatch(
  input: ProfilePatchInput,
  role?: ProfileRole
): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  const profileName = input.profile_name?.trim() || input.display_name?.trim()
  if (profileName) body.profile_name = profileName

  if (input.phone?.trim()) body.phone = input.phone.trim()

  const about = input.about?.trim() || input.bio?.trim()
  if (about) {
    body.about = about
    body.bio = about
  }

  if (input.company_name?.trim()) body.company_name = input.company_name.trim()
  if (input.contact_name?.trim()) body.contact_name = input.contact_name.trim()

  const location =
    input.location?.trim() || input.city?.trim() || input.address?.trim()
  if (location) {
    if (role === "client") {
      body.address = location
    } else if (role === "executor" || role === "coach" || !role) {
      body.city = location
    }
  }

  const experience =
    input.experience_level?.trim() || input.expertise?.trim()
  if (experience) {
    if (role === "coach") {
      body.expertise = experience
    } else if (role === "executor" || !role) {
      body.experience_level = experience
    }
  }

  if (role === "executor") {
    if (input.specializations_text !== undefined) {
      body.specializations = parseSpecializations(input) ?? []
    } else {
      const specs = parseSpecializations(input)
      if (specs?.length) body.specializations = specs
    }
  }

  if (input.website?.trim()) {
    let website = input.website.trim()
    if (!/^https?:\/\//i.test(website)) {
      website = `https://${website}`
    }
    body.website = website
  }

  return body
}
