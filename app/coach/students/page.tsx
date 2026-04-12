"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  Filter,
  Award,
  MessageCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  Download,
  Briefcase,
} from "lucide-react"
import Link from "next/link"

export default function CoachStudentsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const students = [
    {
      id: 1,
      name: "Асель Касымова",
      email: "asel.kasymova@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
      enrolledCourses: [
        {
          id: 1,
          title: "Основы налогового учета",
          progress: 85,
          status: "in_progress",
          enrolledDate: "2024-01-15",
          lastActivity: "2024-01-20",
        },
        {
          id: 2,
          title: "МСФО для малого бизнеса",
          progress: 100,
          status: "completed",
          enrolledDate: "2024-01-10",
          completedDate: "2024-01-18",
          rating: 5,
          review: "Отличный курс! Все понятно объяснено.",
        },
      ],
      totalCourses: 2,
      completedCourses: 1,
      certificatesEarned: 1,
      avgRating: 5,
      joinDate: "2024-01-10",
    },
    {
      id: 2,
      name: "Марат Сериков",
      email: "marat.serikov@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
      enrolledCourses: [
        {
          id: 1,
          title: "Основы налогового учета",
          progress: 45,
          status: "in_progress",
          enrolledDate: "2024-01-12",
          lastActivity: "2024-01-19",
        },
      ],
      totalCourses: 1,
      completedCourses: 0,
      certificatesEarned: 0,
      avgRating: 0,
      joinDate: "2024-01-12",
    },
    {
      id: 3,
      name: "Гульмира Абдуллаева",
      email: "gulmira.abdullaeva@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
      enrolledCourses: [
        {
          id: 1,
          title: "Основы налогового учета",
          progress: 100,
          status: "completed",
          enrolledDate: "2024-01-08",
          completedDate: "2024-01-16",
          rating: 4,
          review: "Хороший курс, много практических примеров.",
        },
        {
          id: 2,
          title: "МСФО для малого бизнеса",
          progress: 30,
          status: "in_progress",
          enrolledDate: "2024-01-16",
          lastActivity: "2024-01-20",
        },
      ],
      totalCourses: 2,
      completedCourses: 1,
      certificatesEarned: 1,
      avgRating: 4,
      joinDate: "2024-01-08",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Завершен</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">В процессе</Badge>
      case "not_started":
        return <Badge className="bg-gray-100 text-gray-800">Не начат</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const getFilteredStudents = () => {
    let filtered = students

    if (activeTab !== "all") {
      switch (activeTab) {
        case "active":
          filtered = filtered.filter((s) => s.enrolledCourses.some((c) => c.status === "in_progress"))
          break
        case "completed":
          filtered = filtered.filter((s) => s.completedCourses > 0)
          break
        case "certificates":
          filtered = filtered.filter((s) => s.certificatesEarned > 0)
          break
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "courses":
          return b.totalCourses - a.totalCourses
        case "completed":
          return b.completedCourses - a.completedCourses
        case "rating":
          return b.avgRating - a.avgRating
        case "newest":
        default:
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
      }
    })
  }

  const totalStats = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.enrolledCourses.some((c) => c.status === "in_progress")).length,
    completedStudents: students.filter((s) => s.completedCourses > 0).length,
    certificatesIssued: students.reduce((sum, student) => sum + student.certificatesEarned, 0),
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
          <Link
            href="/coach/courses"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Мои курсы
          </Link>
          <Link href="/coach/students" className="text-sm font-medium text-purple-600">
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
              <h1 className="text-3xl font-bold text-gray-900">Мои студенты</h1>
              <p className="text-gray-600">Отслеживайте прогресс и взаимодействуйте со студентами</p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4 mr-2" />
              Экспорт данных
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего студентов</p>
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
                    <p className="text-sm font-medium text-gray-600">Активные</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.activeStudents}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Завершили курсы</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.completedStudents}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Сертификатов выдано</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.certificatesIssued}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Award className="w-6 h-6 text-yellow-600" />
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
                      placeholder="Поиск студентов..."
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
                      <SelectItem value="all">Все курсы</SelectItem>
                      <SelectItem value="tax">Налоговый учет</SelectItem>
                      <SelectItem value="ifrs">МСФО</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Сначала новые</SelectItem>
                      <SelectItem value="name">По имени</SelectItem>
                      <SelectItem value="courses">По курсам</SelectItem>
                      <SelectItem value="completed">По завершенным</SelectItem>
                      <SelectItem value="rating">По рейтингу</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Фильтры
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Все студенты</TabsTrigger>
                  <TabsTrigger value="active">Активные</TabsTrigger>
                  <TabsTrigger value="completed">Завершившие</TabsTrigger>
                  <TabsTrigger value="certificates">С сертификатами</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-6 mt-6">
                  {getFilteredStudents().map((student) => (
                    <Card key={student.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">{student.name}</h3>
                                <p className="text-gray-600">{student.email}</p>
                                <p className="text-sm text-gray-500">
                                  Присоединился: {new Date(student.joinDate).toLocaleDateString("ru-RU")}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Написать
                                </Button>
                                <Button size="sm" variant="outline">
                                  <BarChart3 className="w-4 h-4 mr-1" />
                                  Статистика
                                </Button>
                              </div>
                            </div>

                            {/* Student Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                              <div>
                                <span className="text-gray-500">Курсов:</span>
                                <p className="font-medium">{student.totalCourses}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Завершено:</span>
                                <p className="font-medium">{student.completedCourses}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Сертификатов:</span>
                                <p className="font-medium">{student.certificatesEarned}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Средняя оценка:</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="font-medium">{student.avgRating || "—"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Enrolled Courses */}
                            <div className="space-y-3">
                              <h4 className="font-medium">Записанные курсы:</h4>
                              {student.enrolledCourses.map((course) => (
                                <div key={course.id} className="border rounded-lg p-4 bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">{course.title}</h5>
                                    {getStatusBadge(course.status)}
                                  </div>

                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                    <span>Записался: {new Date(course.enrolledDate).toLocaleDateString("ru-RU")}</span>
                                    {course.status === "completed" && course.completedDate && (
                                      <span>
                                        Завершил: {new Date(course.completedDate).toLocaleDateString("ru-RU")}
                                      </span>
                                    )}
                                    {course.status === "in_progress" && course.lastActivity && (
                                      <span>
                                        Последняя активность:{" "}
                                        {new Date(course.lastActivity).toLocaleDateString("ru-RU")}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                      <div className="flex items-center justify-between text-sm mb-1">
                                        <span>Прогресс</span>
                                        <span>{course.progress}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-purple-600 h-2 rounded-full"
                                          style={{ width: `${course.progress}%` }}
                                        ></div>
                                      </div>
                                    </div>

                                    {course.rating && (
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-3 h-3 ${
                                              i < course.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {course.review && (
                                    <div className="mt-3 p-3 bg-white rounded border-l-4 border-l-purple-500">
                                      <p className="text-sm italic">"{course.review}"</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {getFilteredStudents().length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Студенты не найдены</h3>
                      <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
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
