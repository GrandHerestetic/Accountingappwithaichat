"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, CheckCircle, Eye, Loader2, XCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { approveAdminCourse, listAdminCourses, rejectAdminCourse } from "@/lib/api"
import type { Course } from "@/lib/api/types"
import {
  COURSE_STATUS_LABELS,
  MODERATION_STATUS_COLORS,
  MODERATION_STATUS_LABELS,
} from "@/lib/course-utils"
import { toast } from "sonner"

export default function AdminCoursesModerationPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})

  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listAdminCourses({ page: 1, pageSize: 100, moderationStatus: "in_review" })
      setCourses(data.items)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось загрузить курсы")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const handleApprove = async (course: Course) => {
    setActingId(course.id)
    try {
      await approveAdminCourse(course.id)
      toast.success(`Курс «${course.title}» одобрен и опубликован`)
      await loadCourses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось одобрить курс")
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async (course: Course) => {
    setActingId(course.id)
    try {
      await rejectAdminCourse(course.id, rejectReasons[course.id])
      toast.success(`Курс «${course.title}» отклонён`)
      setRejectReasons((prev) => {
        const next = { ...prev }
        delete next[course.id]
        return next
      })
      await loadCourses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось отклонить курс")
    } finally {
      setActingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Модерация курсов
          </h1>
          <p className="text-gray-600 mb-8">
            Курсы появляются в общем каталоге только после вашего одобрения
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Нет курсов, ожидающих модерации
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {COURSE_STATUS_LABELS[course.status]}
                          </Badge>
                          {course.moderation_status && (
                            <Badge className={MODERATION_STATUS_COLORS[course.moderation_status]}>
                              {MODERATION_STATUS_LABELS[course.moderation_status]}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Просмотр
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.description && (
                      <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Отправлен: {new Date(course.updated_at).toLocaleString("ru-RU")}
                      {course.coach_id && <> · автор: <code className="text-xs">{course.coach_id}</code></>}
                    </p>

                    <Textarea
                      placeholder="Причина отклонения (необязательно)"
                      value={rejectReasons[course.id] ?? ""}
                      onChange={(e) =>
                        setRejectReasons((prev) => ({ ...prev, [course.id]: e.target.value }))
                      }
                      rows={2}
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        disabled={actingId === course.id}
                        onClick={() => handleApprove(course)}
                      >
                        {actingId === course.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Одобрить и опубликовать
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={actingId === course.id}
                        onClick={() => handleReject(course)}
                      >
                        {actingId === course.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Отклонить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
