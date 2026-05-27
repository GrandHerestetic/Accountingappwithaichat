import type { Course, CourseAssignment, CourseMaterial } from "@/lib/api/types"

export type CourseStatus = Course["status"]
export type AssignmentStatus = CourseAssignment["status"]
export type ModerationStatus = NonNullable<Course["moderation_status"]>

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: "Черновик",
  published: "Опубликован",
  archived: "В архиве",
}

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  draft: "Не отправлен",
  in_review: "На модерации",
  approved: "Одобрен",
  rejected: "Отклонён",
}

export const MODERATION_STATUS_COLORS: Record<ModerationStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  in_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  assigned: "Назначен",
  in_progress: "В процессе",
  completed: "Завершён",
  overdue: "Просрочен",
  cancelled: "Отменён",
}

export const ASSIGNMENT_STATUS_COLORS: Record<AssignmentStatus, string> = {
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
}

export function computeCourseStats(courses: Course[]) {
  const published = courses.filter(
    (c) => c.status === "published" && c.moderation_status === "approved"
  ).length
  const pending = courses.filter((c) => c.moderation_status === "in_review").length
  const draft = courses.filter((c) => c.status === "draft" && c.moderation_status !== "in_review").length
  const archived = courses.filter((c) => c.status === "archived").length
  const total = courses.length
  const publishedShare = total ? Math.round((published / total) * 100) : 0

  return { total, published, pending, draft, archived, publishedShare }
}

export function isCoursePubliclyAvailable(course: Course): boolean {
  return course.status === "published" && course.moderation_status === "approved"
}

export const ASSIGNMENT_SOURCE_LABELS: Record<string, string> = {
  manual_admin: "Назначение администратором",
  sanction_low_rating_first: "Санкция (первое нарушение)",
  sanction_low_rating_repeat: "Санкция (повторное нарушение)",
  self_enroll: "Самостоятельная запись",
}

export function isAssignmentActive(status: AssignmentStatus): boolean {
  return status === "assigned" || status === "in_progress" || status === "overdue"
}

export function isEnrolledInCourse(assignment: CourseAssignment | null | undefined): boolean {
  return Boolean(assignment && assignment.status !== "cancelled")
}

export function assignmentProgressPercent(assignment: CourseAssignment): number | null {
  return assignment.progress?.progress_percent ?? null
}

export function assignmentMaterialsProgress(assignment: CourseAssignment): {
  completed: number
  total: number
} {
  const completed = assignment.progress?.completed_materials ?? 0
  const total = assignment.progress?.total_materials ?? 0
  return { completed, total }
}

export function isMaterialCompleted(assignment: CourseAssignment, materialId: string): boolean {
  return assignment.progress?.completed_material_ids?.includes(materialId) ?? false
}

export function sortMaterials(materials: CourseMaterial[]): CourseMaterial[] {
  return [...materials].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}
