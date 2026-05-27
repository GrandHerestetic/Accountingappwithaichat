"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Loader2, Search, Users } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useCoachCourses } from "@/hooks/use-swr-hooks"
import { COURSE_STATUS_LABELS } from "@/lib/course-utils"

export default function CoachStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data, isLoading } = useCoachCourses({ page: 1, pageSize: 100 })
  const courses = (data?.items ?? []).filter(
    (c) =>
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <ProtectedRoute allowedRoles={["coach"]}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Студенты</h1>
              <p className="text-gray-600">
                Список студентов по курсам недоступен в текущем API. Ниже — ваши курсы из личного кабинета
                коуча.
              </p>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по названию курса..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : courses.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет курсов для отображения</h3>
                  <p className="text-gray-600 mb-6">Создайте курс, чтобы начать обучение студентов</p>
                  <Link href="/coach/courses/create">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Создать курс
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.description || "Без описания"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        {COURSE_STATUS_LABELS[course.status as keyof typeof COURSE_STATUS_LABELS]}
                      </p>
                      <Link href={`/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          Открыть курс
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
