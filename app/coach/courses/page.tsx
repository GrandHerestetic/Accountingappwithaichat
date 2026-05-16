"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Search, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useCoachCourses } from "@/hooks/use-swr-hooks"

export default function CoachCoursesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const { data, isLoading } = useCoachCourses({ page: 1, pageSize: 100 })

  const courses = useMemo(() => {
    let list = data?.items ?? []
    if (activeTab !== "all") {
      list = list.filter((c) => c.status === activeTab)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [data?.items, activeTab, searchQuery, sortBy])

  const totalStats = useMemo(() => {
    const all = data?.items ?? []
    return {
      totalCourses: all.length,
      publishedCourses: all.filter((c) => c.status === "published").length,
    }
  }, [data?.items])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Опубликован</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Черновик</Badge>
      case "review":
        return <Badge className="bg-yellow-100 text-yellow-800">На модерации</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Отклонен</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
                <h1 className="text-3xl font-bold text-gray-900">Мои курсы</h1>
                <p className="text-gray-600">Управление обучающими материалами</p>
              </div>
              <Link href="/coach/courses/create">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Создать курс
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">Всего курсов</p>
                  <p className="text-2xl font-bold">{totalStats.totalCourses}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">Опубликовано</p>
                  <p className="text-2xl font-bold">{totalStats.publishedCourses}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Поиск курсов..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Сначала новые</SelectItem>
                      <SelectItem value="title">По названию</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Все</TabsTrigger>
                    <TabsTrigger value="published">Опубликованные</TabsTrigger>
                    <TabsTrigger value="draft">Черновики</TabsTrigger>
                    <TabsTrigger value="review">На модерации</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="space-y-4 mt-6">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                      </div>
                    ) : courses.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Курсы не найдены</h3>
                        <p className="text-gray-600 mb-6">
                          {activeTab === "all"
                            ? "У вас пока нет созданных курсов"
                            : `Нет курсов со статусом «${activeTab}»`}
                        </p>
                        <Link href="/coach/courses/create">
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Создать курс
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      courses.map((course) => (
                        <Card key={course.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                  <h4 className="text-lg font-semibold">{course.title}</h4>
                                  {getStatusBadge(course.status)}
                                </div>
                                {course.description && (
                                  <p className="text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                                )}
                                <p className="text-sm text-gray-500">
                                  Обновлён {new Date(course.updated_at).toLocaleDateString("ru-RU")}
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
                      ))
                    )}
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
