"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, TrendingUp, Award, Plus, Eye, FileText, BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useCoachCourses } from "@/hooks/use-swr-hooks"

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user } = useAuth()
  const { data: coursesData } = useCoachCourses({ page: 1, pageSize: 50 })
  const apiCourses = coursesData?.items ?? []

  const publishedCount = apiCourses.filter((c) => c.status === "published").length
  const coachStats = {
    totalCourses: apiCourses.length,
    publishedCourses: publishedCount,
    completionRate: apiCourses.length ? Math.round((publishedCount / apiCourses.length) * 100) : 0,
  }

  const courses = apiCourses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description ?? "",
    status: c.status,
    lastUpdated: c.updated_at,
  }))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Опубликован</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Черновик</Badge>
      case "review":
        return <Badge className="bg-yellow-100 text-yellow-800">На модерации</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={["coach"]}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать, {user?.profile?.profile_name ?? user?.email}! 👋</h1>
                <p className="text-gray-600">Управляйте курсами и отслеживайте прогресс студентов</p>
              </div>
              <div className="flex gap-3">
                <Link href="/coach/courses/create">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Создать курс
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Настройки
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Всего курсов</p>
                      <p className="text-2xl font-bold text-gray-900">{coachStats.totalCourses}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{coachStats.publishedCourses}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Процент завершения</p>
                      <p className="text-2xl font-bold text-gray-900">{coachStats.completionRate}%</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Черновики</p>
                      <p className="text-2xl font-bold text-gray-900">{coachStats.totalCourses - coachStats.publishedCourses}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
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
                      {/* Quick Stats */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Быстрая статистика</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Всего курсов:</span>
                            <span className="font-bold">{coachStats.totalCourses}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Опубликовано:</span>
                            <span className="font-bold">{coachStats.publishedCourses}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Доля опубликованных:</span>
                            <span className="font-bold">{coachStats.completionRate}%</span>
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

                    {/* Top Courses */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Популярные курсы</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {courses
                            .filter((c) => c.status === "published")
                            .slice(0, 3)
                            .map((course) => (
                              <div
                                key={course.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium">{course.title}</h4>
                                  <p className="text-sm text-gray-500 mt-1">Статус: {course.status}</p>
                                </div>
                              </div>
                            ))}
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
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                Просмотр
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4 mt-6">
                    <Card>
                      <CardContent className="py-10 text-center">
                        <p className="text-gray-600 mb-4">Подробная аналитика доступна на отдельной странице</p>
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
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Управление студентами</h3>
                      <p className="text-gray-600 mb-6">Просматривайте прогресс студентов и выдавайте сертификаты</p>
                      <Link href="/coach/students">
                        <Button className="bg-purple-600 hover:bg-purple-700">Посмотреть всех студентов</Button>
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
