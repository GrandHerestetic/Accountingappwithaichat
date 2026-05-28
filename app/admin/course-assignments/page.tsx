"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Loader2, UserPlus } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import {
  createAdminCourseAssignment,
  listAdminCourseAssignments,
  listAdminExecutors,
  listCourses,
} from "@/lib/api"
import type { AdminExecutorUser, Course, CourseAssignment } from "@/lib/api/types"
import {
  ASSIGNMENT_SOURCE_LABELS,
  ASSIGNMENT_STATUS_COLORS,
  ASSIGNMENT_STATUS_LABELS,
  isCoursePubliclyAvailable,
} from "@/lib/course-utils"
import { toast } from "sonner"

export default function AdminCourseAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [executors, setExecutors] = useState<AdminExecutorUser[]>([])
  const [assignments, setAssignments] = useState<CourseAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [courseId, setCourseId] = useState("")
  const [executorId, setExecutorId] = useState("")
  const [reason, setReason] = useState("")
  const [dueAt, setDueAt] = useState("")

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [coursesData, executorsData, assignmentsData] = await Promise.all([
        listCourses({ page: 1, pageSize: 100, status: "published" }),
        listAdminExecutors({ page: 1, pageSize: 500 }),
        listAdminCourseAssignments({ page: 1, pageSize: 50 }),
      ])
      setCourses(coursesData.items.filter(isCoursePubliclyAvailable))
      setExecutors(executorsData.items.filter((e) => e.is_active))
      setAssignments(assignmentsData.items)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось загрузить данные")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const executorLabel = (e: AdminExecutorUser) => {
    const name = e.display_name?.trim()
    if (name) return `${name} (${e.email})`
    return e.email
  }

  const executorDisplayById = (id: string) => {
    const e = executors.find((x) => x.user_id === id)
    return e ? executorLabel(e) : id
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId.trim() || !executorId.trim()) {
      toast.error("Выберите курс и исполнителя")
      return
    }

    setSubmitting(true)
    try {
      await createAdminCourseAssignment({
        course_id: courseId,
        executor_id: executorId.trim(),
        source: "manual_admin",
        reason: reason.trim() || undefined,
        due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
      })
      toast.success("Курс назначен исполнителю")
      setCourseId("")
      setExecutorId("")
      setReason("")
      setDueAt("")
      await loadData()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось назначить курс"
      if (message.toLowerCase().includes("conflict") || message.includes("409")) {
        toast.error("У исполнителя уже есть активное назначение на этот курс")
      } else {
        toast.error(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Назначение курсов
          </h1>
          <p className="text-gray-600 mb-8">
            Назначайте опубликованные курсы исполнителям из списка зарегистрированных в системе
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Новое назначение
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Курс</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger id="course">
                        <SelectValue placeholder="Выберите курс" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="executor">Исполнитель</Label>
                    {executors.length === 0 ? (
                      <p className="text-sm text-amber-700">
                        Нет активных исполнителей. Одобрите заявки в разделе «Заявки исполнителей».
                      </p>
                    ) : (
                      <Select value={executorId} onValueChange={setExecutorId}>
                        <SelectTrigger id="executor">
                          <SelectValue placeholder="Выберите исполнителя" />
                        </SelectTrigger>
                        <SelectContent>
                          {executors.map((executor) => (
                            <SelectItem key={executor.user_id} value={executor.user_id}>
                              {executorLabel(executor)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Причина (необязательно)</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Например: обязательное обучение по налоговому учёту"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due">Срок прохождения (необязательно)</Label>
                    <Input
                      id="due"
                      type="datetime-local"
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || loading || executors.length === 0}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Назначить курс
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Последние назначения</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : assignments.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">Назначений пока нет</p>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto">
                    {assignments.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {item.course?.title ?? `Курс ${item.course_id.slice(0, 8)}…`}
                          </p>
                          <Badge className={ASSIGNMENT_STATUS_COLORS[item.status]}>
                            {ASSIGNMENT_STATUS_LABELS[item.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Исполнитель: {executorDisplayById(item.executor_id)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Источник: {ASSIGNMENT_SOURCE_LABELS[item.source] ?? item.source}
                          {" · "}
                          {new Date(item.assigned_at ?? item.created_at).toLocaleString("ru-RU")}
                        </p>
                        {item.reason && <p className="text-sm text-gray-600">{item.reason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
