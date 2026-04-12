"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Users,
  Star,
  Award,
  TrendingUp,
  Briefcase,
} from "lucide-react"
import Link from "next/link"

export default function CoachCoursesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const courses = [
    {
      id: 1,
      title: "Основы налогового учета в Казахстане 2024",
      description: "Полный курс по налоговому учету для начинающих бухгалтеров",
      status: "published",
      students: 89,
      rating: 4.8,
      reviews: 34,
      revenue: "156000 ₸",
      lessons: 12,
      duration: "8 часов",
      price: "15000 ₸",
      completionRate: 92,
      lastUpdated: "2024-01-15",
      views: 1250,
      enrollments: 89,
      category: "Налоговый учет",
    },
    {
      id: 2,
      title: "МСФО для малого и среднего бизнеса",
      description: "Международные стандарты финансовой отчетности",
      status: "published",
      students: 67,
      rating: 4.9,
      reviews: 28,
      revenue: "198000 ₸",
      lessons: 15,
      duration: "12 часов",
      price: "25000 ₸",
      completionRate: 85,
      lastUpdated: "2024-01-10",
      views: 890,
      enrollments: 67,
      category: "МСФО",
    },
    {
      id: 3,
      title: "Автоматизация бухгалтерского учета",
      description: "Работа с современными программами учета",
      status: "draft",
      students: 0,
      rating: 0,
      reviews: 0,
      revenue: "0 ₸",
      lessons: 8,
      duration: "6 часов",
      price: "12000 ₸",
      completionRate: 0,
      lastUpdated: "2024-01-20",
      views: 45,
      enrollments: 0,
      category: "Автоматизация",
    },
    {
      id: 4,
      title: "Восстановление бухгалтерского учета",
      description: "Пошаговое руководство по восстановлению учета",
      status: "review",
      students: 0,
      rating: 0,
      reviews: 0,
      revenue: "0 ₸",
      lessons: 10,
      duration: "8 часов",
      price: "18000 ₸",
      completionRate: 0,
      lastUpdated: "2024-01-18",
      views: 123,
      enrollments: 0,
      category: "Восстановление учета",
    },
  ]

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
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const getFilteredCourses = () => {
    let filtered = courses

    if (activeTab !== "all") {
      filtered = filtered.filter((course) => course.status === activeTab)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "students":
          return b.students - a.students
        case "revenue":
          return Number.parseInt(b.revenue.replace(/\D/g, "")) - Number.parseInt(a.revenue.replace(/\D/g, ""))
        case "rating":
          return b.rating - a.rating
        case "newest":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      }
    })
  }

  const totalStats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === "published").length,
    totalStudents: courses.reduce((sum, course) => sum + course.students, 0),
    totalRevenue: courses.reduce((sum, course) => sum + Number.parseInt(course.revenue.replace(/[^\d]/g, "")), 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Header */}
      <header className="px-4 lg:px-6 h-20 flex items-center bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center justify-center">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BuhPro
          </span>
        </Link>
        <nav className="ml-auto flex gap-8">
          <Link
            href="/coach/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Дашборд
          </Link>
          <Link href="/coach/courses" className="text-sm font-medium text-purple-600">
            Мои курсы
          </Link>
          <Link
            href="/coach/students"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Студенты
          </Link>
          <Link
            href="/coach/analytics"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Аналитика
          </Link>
        </nav>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Мои курсы</h1>
              <p className="text-gray-600">Управляйте своими обучающими курсами</p>
            </div>
            <Link href="/coach/courses/create">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Создать курс
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего курсов</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.totalCourses}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{totalStats.publishedCourses}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Студентов</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.totalStudents}</p>
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
                    <p className="text-sm font-medium text-gray-600">Общий доход</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.totalRevenue.toLocaleString()} ₸</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск курсов..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      <SelectItem value="tax">Налоговый учет</SelectItem>
                      <SelectItem value="ifrs">МСФО</SelectItem>
                      <SelectItem value="automation">Автоматизация</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Сначала новые</SelectItem>
                      <SelectItem value="students">По студентам</SelectItem>
                      <SelectItem value="revenue">По доходу</SelectItem>
                      <SelectItem value="rating">По рейтингу</SelectItem>
                      <SelectItem value="title">По названию</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Фильтры
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses List */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Все ({courses.length})</TabsTrigger>
                  <TabsTrigger value="published">
                    Опубликованные ({courses.filter((c) => c.status === "published").length})
                  </TabsTrigger>
                  <TabsTrigger value="draft">
                    Черновики ({courses.filter((c) => c.status === "draft").length})
                  </TabsTrigger>
                  <TabsTrigger value="review">
                    На модерации ({courses.filter((c) => c.status === "review").length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Отклоненные ({courses.filter((c) => c.status === "rejected").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4 mt-6">
                  {getFilteredCourses().map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold">{course.title}</h4>
                              {getStatusBadge(course.status)}
                            </div>
                            <p className="text-gray-600 mb-4">{course.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Студенты:</span>
                                <p className="font-medium">{course.students}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Рейтинг:</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="font-medium">{course.rating || "—"}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Уроков:</span>
                                <p className="font-medium">{course.lessons}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Длительность:</span>
                                <p className="font-medium">{course.duration}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Просмотры:</span>
                                <p className="font-medium">{course.views}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Доход:</span>
                                <p className="font-medium text-green-600">{course.revenue}</p>
                              </div>
                            </div>

                            {course.status === "published" && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-green-700">Процент завершения: {course.completionRate}%</span>
                                  <span className="text-green-700">{course.reviews} отзывов</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                Просмотр
                              </Button>
                            </Link>
                            <Link href={`/coach/courses/${course.id}/edit`}>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4 mr-1" />
                                Редактировать
                              </Button>
                            </Link>
                            {course.status === "published" && (
                              <Link href={`/coach/courses/${course.id}/analytics`}>
                                <Button size="sm" variant="outline">
                                  <BarChart3 className="w-4 h-4 mr-1" />
                                  Статистика
                                </Button>
                              </Link>
                            )}
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {getFilteredCourses().length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Курсы не найдены</h3>
                      <p className="text-gray-600 mb-6">
                        {activeTab === "all"
                          ? "У вас пока нет созданных курсов"
                          : `Нет курсов со статусом "${activeTab}"`}
                      </p>
                      <Link href="/coach/courses/create">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Создать первый курс
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
