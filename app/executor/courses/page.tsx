"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BookOpen, CheckCircle, Clock, Loader2, Play, XCircle } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { listMyCourseAssignments } from "@/lib/api"
import type { CourseAssignment } from "@/lib/api/types"
import {
  ASSIGNMENT_SOURCE_LABELS,
  ASSIGNMENT_STATUS_COLORS,
  ASSIGNMENT_STATUS_LABELS,
  assignmentMaterialsProgress,
  assignmentProgressPercent,
  isAssignmentActive,
} from "@/lib/course-utils"
import { toast } from "sonner"

export default function ExecutorCoursesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assignments, setAssignments] = useState<CourseAssignment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listMyCourseAssignments({ page: 1, pageSize: 50 })
      setAssignments(data.items)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось загрузить назначенные курсы"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const filteredAssignments = useMemo(() => {
    if (statusFilter === "all") return assignments
    if (statusFilter === "active") {
      return assignments.filter((a) => isAssignmentActive(a.status))
    }
    return assignments.filter((a) => a.status === statusFilter)
  }, [assignments, statusFilter])

  return (
    <ProtectedRoute allowedRoles={["executor"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Мои курсы</h1>
                <p className="text-gray-600">
                  Проходите этапы курса по одному — после всех этапов курс завершится автоматически
                </p>
              </div>
              <Link href="/courses">
                <Button variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Каталог курсов
                </Button>
              </Link>
            </div>

            <div className="mb-6">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="assigned">Назначен</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="completed">Завершённые</SelectItem>
                  <SelectItem value="overdue">Просроченные</SelectItem>
                  <SelectItem value="cancelled">Отменённые</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading && (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {!loading && filteredAssignments.length > 0 && (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => {
                  const course = assignment.course
                  const progress = assignmentProgressPercent(assignment)
                  const { completed, total } = assignmentMaterialsProgress(assignment)

                  return (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <CardTitle className="text-lg">
                                {course?.title ?? `Курс ${assignment.course_id.slice(0, 8)}…`}
                              </CardTitle>
                              <Badge className={ASSIGNMENT_STATUS_COLORS[assignment.status]}>
                                {ASSIGNMENT_STATUS_LABELS[assignment.status]}
                              </Badge>
                            </div>
                            {course?.description ? (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                            ) : null}

                            {total > 0 && (
                              <div className="mb-3 space-y-1">
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>
                                    Этапы: {completed} / {total}
                                  </span>
                                  {progress !== null && <span>{progress}%</span>}
                                </div>
                                <Progress value={progress ?? 0} className="h-2" />
                              </div>
                            )}

                            <p className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Назначен:{" "}
                                {new Date(assignment.assigned_at ?? assignment.created_at).toLocaleDateString(
                                  "ru-RU"
                                )}
                              </span>
                              {assignment.status === "completed" && assignment.completed_at && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  Завершён:{" "}
                                  {new Date(assignment.completed_at).toLocaleDateString("ru-RU")}
                                </span>
                              )}
                              {assignment.status === "cancelled" && (
                                <span className="flex items-center gap-1 text-gray-500">
                                  <XCircle className="h-4 w-4" />
                                  Отменён
                                </span>
                              )}
                              <span className="text-xs text-gray-400">
                                {ASSIGNMENT_SOURCE_LABELS[assignment.source] ?? assignment.source}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0">
                          <Link href={`/courses/${assignment.course_id}`}>
                            <Button
                              size="sm"
                              className={
                                assignment.status === "completed"
                                  ? ""
                                  : "bg-blue-600 hover:bg-blue-700"
                              }
                              variant={assignment.status === "completed" ? "outline" : "default"}
                            >
                              {assignment.status === "completed" ? (
                                <>
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  Открыть
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  {completed > 0 ? "Продолжить" : "Начать"}
                                </>
                              )}
                            </Button>
                          </Link>
                          {assignment.status === "completed" && (
                            <Link href={`/courses/${assignment.course_id}?tab=review`}>
                              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Оставить отзыв
                              </Button>
                            </Link>
                          )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            )}

            {!loading && filteredAssignments.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет курсов для прохождения</h3>
                  <p className="text-gray-600 mb-6">
                    {statusFilter !== "all"
                      ? "Нет курсов с выбранным статусом"
                      : "Запишитесь на курс в каталоге или дождитесь назначения от администратора"}
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
