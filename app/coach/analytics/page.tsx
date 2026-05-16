"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useCoachCourses } from "@/hooks/use-swr-hooks"

export default function CoachAnalyticsPage() {
  const { data, isLoading } = useCoachCourses({ page: 1, pageSize: 100 })
  const courses = data?.items ?? []
  const published = courses.filter((c) => c.status === "published")

  return (
    <ProtectedRoute allowedRoles={["coach"]}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Аналитика курсов</h1>
              <p className="text-gray-600">Сводка по вашим курсам из личного кабинета</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600">Всего курсов</p>
                      <p className="text-3xl font-bold">{courses.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600">Опубликовано</p>
                      <p className="text-3xl font-bold">{published.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600">Черновики</p>
                      <p className="text-3xl font-bold">{courses.length - published.length}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Курсы</CardTitle>
                    <CardDescription>
                      Детальная аналитика по студентам и доходам появится после подключения соответствующих
                      эндпоинтов API
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {courses.length === 0 ? (
                      <div className="text-center py-12 text-gray-600">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="mb-4">У вас пока нет курсов</p>
                        <Link href="/coach/courses/create">
                          <Button className="bg-purple-600 hover:bg-purple-700">Создать курс</Button>
                        </Link>
                      </div>
                    ) : (
                      courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-gray-500">
                              Обновлён {new Date(course.updated_at).toLocaleDateString("ru-RU")}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{course.status}</Badge>
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" variant="outline">
                                Открыть
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
