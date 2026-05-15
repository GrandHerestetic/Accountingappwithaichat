"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, CheckCircle, Clock, Loader2, XCircle } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { listMyCourseAssignments, markCourseAssignmentCompleted } from "@/lib/api"
import type { CourseAssignment, PaginatedResponse } from "@/lib/api/types"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Status display helpers
// ---------------------------------------------------------------------------
const ASSIGNMENT_STATUS_COLORS: Record<CourseAssignment["status"], string> = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
}

const ASSIGNMENT_STATUS_LABELS: Record<CourseAssignment["status"], string> = {
  active: "Активен",
  completed: "Завершён",
  cancelled: "Отменён",
}

export default function ExecutorCoursesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assignments, setAssignments] = useState<CourseAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Fetch course assignments (requirement 7.3)
  // ---------------------------------------------------------------------------
  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", "1")
      params.set("page_size", "20")
      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }

      const data = await listMyCourseAssignments({
        page: 1,
        pageSize: 50,
        status: params.get("status") ?? undefined,
      })
      setAssignments(data.items)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось загрузить назначенные курсы"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // ---------------------------------------------------------------------------
  // Mark assignment as completed (requirement 7.4)
  // ---------------------------------------------------------------------------
  const handleMarkCompleted = async (assignmentId: string) => {
    setMarkingId(assignmentId)
    try {
      await markCourseAssignmentCompleted(assignmentId)
      // Update the assignment status in the UI immediately
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, status: "completed" as const } : a
        )
      )
      toast.success("Курс отмечен как завершённый")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось отметить курс как завершённый"
      toast.error(message)
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["executor"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Мои курсы</h1>
                <p className="text-gray-600">Назначенные вам обучающие курсы</p>
              </div>
              <Link href="/courses">
                <Button variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Каталог курсов
                </Button>
              </Link>
            </div>

            {/* Filter */}
            <div className="mb-6">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="completed">Завершённые</SelectItem>
                  <SelectItem value="cancelled">Отменённые</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Assignments list */}
            {!loading && assignments.length > 0 && (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              Курс #{assignment.course_id}
                            </CardTitle>
                            <Badge className={ASSIGNMENT_STATUS_COLORS[assignment.status]}>
                              {ASSIGNMENT_STATUS_LABELS[assignment.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Назначен:{" "}
                              {new Date(assignment.created_at).toLocaleDateString("ru-RU")}
                            </span>
                            {assignment.status === "completed" && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                Завершён:{" "}
                                {new Date(assignment.updated_at).toLocaleDateString("ru-RU")}
                              </span>
                            )}
                            {assignment.status === "cancelled" && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <XCircle className="h-4 w-4" />
                                Отменён
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <Link href={`/courses/${assignment.course_id}`}>
                            <Button variant="outline" size="sm">
                              <BookOpen className="h-4 w-4 mr-1" />
                              Открыть
                            </Button>
                          </Link>

                          {assignment.status === "active" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={markingId === assignment.id}
                              onClick={() => handleMarkCompleted(assignment.id)}
                            >
                              {markingId === assignment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Завершить
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && assignments.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Нет назначенных курсов
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {statusFilter !== "all"
                      ? "Нет курсов с выбранным статусом"
                      : "Вам пока не назначены курсы"}
                  </p>
                  <Link href="/courses">
                    <Button>Просмотреть каталог курсов</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
