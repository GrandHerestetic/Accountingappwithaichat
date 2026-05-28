import type { UserProfile } from "@/lib/api/types"

export type AppRole = "client" | "executor" | "coach" | "admin"

/** User can access coach features (dedicated coach or executor with coach profile). */
export function userIsCoach(user: UserProfile | null | undefined): boolean {
  if (!user) return false
  if (user.role === "coach") return true
  return user.role === "executor" && Boolean(user.is_coach)
}

export function userHasAllowedRole(
  user: UserProfile | null | undefined,
  allowedRoles: AppRole[]
): boolean {
  if (!user) return false
  if (allowedRoles.includes(user.role)) return true
  if (allowedRoles.includes("coach") && userIsCoach(user)) return true
  return false
}
