import type { Course, CourseAssignment, CourseMaterial } from "@/lib/api/types"

export type CourseStatus = Course["status"]
export type AssignmentStatus = CourseAssignment["status"]

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: "Черновик",
  published: "Опубликован",
  archived: "В архиве",
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
  const published = courses.filter((c) => c.status === "published").length
  const draft = courses.filter((c) => c.status === "draft").length
  const archived = courses.filter((c) => c.status === "archived").length
  const total = courses.length
  const publishedShare = total ? Math.round((published / total) * 100) : 0

  return { total, published, draft, archived, publishedShare }
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

export function assignmentProgressPercent(assignment: CourseAssignment): number | null {
  return assignment.progress?.progress_percent ?? null
}

export function sortMaterials(materials: CourseMaterial[]): CourseMaterial[] {
  return [...materials].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}
