"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Archive, TrendingUp, Award, Plus, Eye, FileText, BarChart3, Pencil } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useCoachCourses } from "@/hooks/use-swr-hooks"
import { COURSE_STATUS_LABELS, computeCourseStats } from "@/lib/course-utils"

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user } = useAuth()
  const { data: coursesData, isLoading } = useCoachCourses({ page: 1, pageSize: 100 })
  const apiCourses = coursesData?.items ?? []
  const stats = computeCourseStats(apiCourses)

  const courses = apiCourses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description ?? "",
    status: c.status,
    lastUpdated: c.updated_at,
  }))

  const getStatusBadge = (status: string) => {
    const label = COURSE_STATUS_LABELS[status as keyof typeof COURSE_STATUS_LABELS]
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">{label}</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">{label}</Badge>
      case "archived":
        return <Badge className="bg-slate-100 text-slate-800">{label}</Badge>
      default:
        return <Badge variant="secondary">{label ?? status}</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={["coach"]}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Добро пожаловать, {user?.profile?.profile_name ?? user?.email}! 👋
                </h1>
                <p className="text-gray-600">Управляйте курсами из личного кабинета коуча</p>
              </div>
              <div className="flex gap-3">
                <Link href="/coach/courses/create">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Создать курс
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Всего курсов</p>
                      <p className="text-2xl font-bold text-gray-900">{isLoading ? "…" : stats.total}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Опубликовано</p>
                      <p className="text-2xl font-bold text-gray-900">{isLoading ? "…" : stats.published}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Черновики</p>
                      <p className="text-2xl font-bold text-gray-900">{isLoading ? "…" : stats.draft}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">В архиве</p>
                      <p className="text-2xl font-bold text-gray-900">{isLoading ? "…" : stats.archived}</p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-full">
                      <Archive className="w-6 h-6 text-slate-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Управление курсами</CardTitle>
                <CardDescription>Создавайте, редактируйте и отслеживайте ваши обучающие курсы</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="courses">Мои курсы</TabsTrigger>
                    <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                    <TabsTrigger value="students">Студенты</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Быстрая статистика</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Всего курсов:</span>
                            <span className="font-bold">{stats.total}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Опубликовано:</span>
                            <span className="font-bold">{stats.published}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Доля опубликованных:</span>
                            <span className="font-bold">{stats.publishedShare}%</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Быстрые действия</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Link href="/coach/courses/create">
                            <Button className="w-full bg-purple-600 hover:bg-purple-700">
                              <Plus className="w-4 h-4 mr-2" />
                              Создать курс
                            </Button>
                          </Link>
                          <Link href="/coach/courses">
                            <Button variant="outline" className="w-full">
                              <FileText className="w-4 h-4 mr-2" />
                              Все курсы
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Недавно обновлённые курсы</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[...courses]
                            .sort(
                              (a, b) =>
                                new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
                            )
                            .slice(0, 3)
                            .map((course) => (
                              <div
                                key={course.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium">{course.title}</h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {COURSE_STATUS_LABELS[course.status as keyof typeof COURSE_STATUS_LABELS]} ·{" "}
                                    {new Date(course.lastUpdated).toLocaleDateString("ru-RU")}
                                  </p>
                                </div>
                                {course.status === "draft" ? (
                                  <Link href={`/coach/courses/${course.id}/edit`}>
                                    <Button size="sm" variant="outline">
                                      <Pencil className="w-4 h-4 mr-1" />
                                      Редактировать
                                    </Button>
                                  </Link>
                                ) : (
                                  <Link href={`/courses/${course.id}`}>
                                    <Button size="sm" variant="outline">
                                      <Eye className="w-4 h-4 mr-1" />
                                      Открыть
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            ))}
                          {courses.length === 0 && !isLoading && (
                            <p className="text-sm text-gray-500 text-center py-6">Курсов пока нет</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="courses" className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Мои курсы ({courses.length})</h3>
                      <Link href="/coach/courses/create">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Создать курс
                        </Button>
                      </Link>
                    </div>

                    {courses.map((course) => (
                      <Card key={course.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold">{course.title}</h4>
                                {getStatusBadge(course.status)}
                              </div>
                              <p className="text-gray-600 mb-3">{course.description}</p>
                              <p className="text-sm text-gray-500">
                                Обновлён {new Date(course.lastUpdated).toLocaleDateString("ru-RU")}
                              </p>
                            </div>
                            {course.status === "draft" ? (
                              <Link href={`/coach/courses/${course.id}/edit`}>
                                <Button size="sm" variant="outline">
                                  <Pencil className="w-4 h-4 mr-1" />
                                  Редактировать
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/courses/${course.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Просмотр
                                </Button>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4 mt-6">
                    <Card>
                      <CardContent className="py-10 text-center">
                        <p className="text-gray-600 mb-4">
                          Подробная аналитика по студентам недоступна в текущем API
                        </p>
                        <Link href="/coach/analytics">
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Открыть аналитику
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="students" className="space-y-4 mt-6">
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-6">
                        Назначение студентов на курсы выполняется администратором через API assignments
                      </p>
                      <Link href="/coach/students">
                        <Button className="bg-purple-600 hover:bg-purple-700">Перейти к курсам</Button>
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
