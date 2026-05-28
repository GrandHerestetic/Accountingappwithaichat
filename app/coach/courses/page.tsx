"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Search, Eye, Loader2, Pencil, Trash2, Archive } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useCoachCourses } from "@/hooks/use-swr-hooks"
import { archiveCoachCourse, deleteCoachCourse } from "@/lib/api"
import { COURSE_STATUS_LABELS, MODERATION_STATUS_COLORS, MODERATION_STATUS_LABELS, computeCourseStats } from "@/lib/course-utils"
import { toast } from "sonner"

export default function CoachCoursesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const { data, isLoading, mutate } = useCoachCourses({ page: 1, pageSize: 100 })

  const stats = useMemo(() => computeCourseStats(data?.items ?? []), [data?.items])

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
          (c.description ?? "").toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [data?.items, activeTab, searchQuery, sortBy])

  const getModerationBadge = (course: (typeof courses)[number]) => {
    const status = course.moderation_status ?? "draft"
    return (
      <Badge className={MODERATION_STATUS_COLORS[status]}>
        {MODERATION_STATUS_LABELS[status]}
      </Badge>
    )
  }

  const handleArchiveCourse = async (course: (typeof courses)[number]) => {
    const confirmed = confirm(
      `Переместить курс «${course.title}» в архив? Он станет неактивным и исчезнет из каталога.`
    )
    if (!confirmed) return

    try {
      await archiveCoachCourse(course.id)
      toast.success("Курс перемещён в архив и деактивирован")
      await mutate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось отправить курс в архив")
    }
  }

  const handleDeleteCourse = async (course: (typeof courses)[number]) => {
    const confirmed = confirm(
      `Удалить курс «${course.title}» без возможности восстановления?`
    )
    if (!confirmed) return

    try {
      await deleteCoachCourse(course.id)
      toast.success("Курс удалён")
      await mutate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить курс")
    }
  }

  const getStatusBadge = (status: string) => {
    const label = COURSE_STATUS_LABELS[status as keyof typeof COURSE_STATUS_LABELS] ?? status
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">{label}</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">{label}</Badge>
      case "archived":
        return <Badge className="bg-slate-100 text-slate-800">{label}</Badge>
      default:
        return <Badge variant="secondary">{label}</Badge>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">Всего</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">Опубликовано</p>
                  <p className="text-2xl font-bold">{stats.published}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">На модерации</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">Черновики</p>
                  <p className="text-2xl font-bold">{stats.draft}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">В архиве</p>
                  <p className="text-2xl font-bold">{stats.archived}</p>
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
                    <TabsTrigger value="archived">Архив</TabsTrigger>
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
                            : `Нет курсов со статусом «${COURSE_STATUS_LABELS[activeTab as keyof typeof COURSE_STATUS_LABELS] ?? activeTab}»`}
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
                                  {getModerationBadge(course)}
                                </div>
                                {course.description && (
                                  <p className="text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                                )}
                                <p className="text-sm text-gray-500">
                                  Обновлён {new Date(course.updated_at).toLocaleDateString("ru-RU")}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                <Link href={`/coach/courses/${course.id}/edit`}>
                                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                                    <Pencil className="w-4 h-4 mr-1" />
                                    Редактировать
                                  </Button>
                                </Link>
                                {course.status !== "draft" && (
                                  <Link href={`/courses/${course.id}`}>
                                    <Button size="sm" variant="outline" className="w-full">
                                      <Eye className="w-4 h-4 mr-1" />
                                      Просмотр
                                    </Button>
                                  </Link>
                                )}
                                {course.status !== "archived" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => void handleArchiveCourse(course)}
                                  >
                                    <Archive className="w-4 h-4 mr-1" />
                                    В архив
                                  </Button>
                                )}
                                {course.status === "draft" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-red-600 hover:text-red-700"
                                    onClick={() => void handleDeleteCourse(course)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Удалить
                                  </Button>
                                )}
                              </div>
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
