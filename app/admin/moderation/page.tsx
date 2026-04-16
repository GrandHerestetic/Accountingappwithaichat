"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Briefcase,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Flag,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Star,
} from "lucide-react"
import Link from "next/link"

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState("courses")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for courses awaiting moderation
  const pendingCourses = [
    {
      id: 1,
      title: "Основы МСФО для начинающих",
      author: "Марат Касымов",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      category: "Международные стандарты",
      description: "Полный курс по международным стандартам финансовой отчетности",
      duration: "8 часов",
      lessons: 12,
      price: 25000,
      submittedDate: "2024-01-18",
      status: "pending",
      content: {
        videos: 8,
        documents: 15,
        tests: 3,
      },
      flags: 0,
    },
    {
      id: 2,
      title: "Налоговое планирование в Казахстане",
      author: "Айгуль Нурланова",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      category: "Налогообложение",
      description: "Стратегии оптимизации налогов для бизнеса",
      duration: "6 часов",
      lessons: 10,
      price: 35000,
      submittedDate: "2024-01-17",
      status: "pending",
      content: {
        videos: 6,
        documents: 12,
        tests: 2,
      },
      flags: 1,
      flagReason: "Жалоба на устаревшую информацию",
    },
    {
      id: 3,
      title: "Автоматизация бухучета в 1С",
      author: "Данияр Абдуллаев",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      category: "Программное обеспечение",
      description: "Практическое руководство по настройке 1С:Бухгалтерия",
      duration: "12 часов",
      lessons: 18,
      price: 45000,
      submittedDate: "2024-01-16",
      status: "flagged",
      content: {
        videos: 12,
        documents: 20,
        tests: 4,
      },
      flags: 3,
      flagReason: "Нарушение авторских прав, некачественный контент",
    },
  ]

  // Mock data for course responses/reviews awaiting moderation
  const pendingResponses = [
    {
      id: 1,
      courseId: 101,
      courseTitle: "Основы бухгалтерского учета",
      author: "Алия Смагулова",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      rating: 2,
      comment: "Курс устарел, информация не актуальна. Много ошибок в примерах.",
      submittedDate: "2024-01-19",
      status: "pending",
      type: "review",
      flags: 2,
      flagReason: "Неконструктивная критика",
    },
    {
      id: 2,
      courseId: 102,
      courseTitle: "МСФО для продвинутых",
      author: "Ерлан Касымов",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      comment: "Отличный курс! Все понятно объяснено. Рекомендую всем коллегам.",
      submittedDate: "2024-01-19",
      status: "pending",
      type: "review",
      flags: 0,
    },
    {
      id: 3,
      courseId: 103,
      courseTitle: "Налоговый кодекс 2024",
      author: "Гульнара Оспанова",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      rating: 1,
      comment: "Полная ерунда! Автор не знает о чем говорит. Деньги на ветер!",
      submittedDate: "2024-01-18",
      status: "flagged",
      type: "review",
      flags: 5,
      flagReason: "Оскорбительные высказывания, спам",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Ожидает модерации</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Одобрено</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Отклонено</Badge>
      case "flagged":
        return <Badge className="bg-red-100 text-red-800">С жалобами</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const moderationStats = {
    pendingCourses: pendingCourses.filter((c) => c.status === "pending").length,
    flaggedCourses: pendingCourses.filter((c) => c.flags > 0).length,
    pendingResponses: pendingResponses.filter((r) => r.status === "pending").length,
    flaggedResponses: pendingResponses.filter((r) => r.flags > 0).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
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
            href="/admin/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
          >
            Дашборд
          </Link>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
          >
            Пользователи
          </Link>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
          >
            Заказы
          </Link>
          <Link href="/admin/moderation" className="text-sm font-medium text-orange-600">
            Модерация
          </Link>
          <Link
            href="/admin/disputes"
            className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
          >
            Споры
          </Link>
          <Link
            href="/admin/analytics"
            className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
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
              <h1 className="text-3xl font-bold text-gray-900">Модерация контента</h1>
              <p className="text-gray-600">Модерируйте курсы, отзывы и отклики пользователей</p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Массовые действия
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Курсы на модерации</p>
                    <p className="text-2xl font-bold text-gray-900">{moderationStats.pendingCourses}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <BookOpen className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Курсы с жалобами</p>
                    <p className="text-2xl font-bold text-gray-900">{moderationStats.flaggedCourses}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Flag className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Отзывы на модерации</p>
                    <p className="text-2xl font-bold text-gray-900">{moderationStats.pendingResponses}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Отзывы с жалобами</p>
                    <p className="text-2xl font-bold text-gray-900">{moderationStats.flaggedResponses}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию, автору..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Moderation Content */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="courses">Курсы ({pendingCourses.length})</TabsTrigger>
                  <TabsTrigger value="responses">Отзывы ({pendingResponses.length})</TabsTrigger>
                </TabsList>

                {/* Courses Moderation */}
                <TabsContent value="courses" className="space-y-6 mt-6">
                  {pendingCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={course.authorAvatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {course.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                              <p className="text-gray-600 text-sm mb-2">Автор: {course.author}</p>
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusBadge(course.status)}
                                <Badge variant="outline">{course.category}</Badge>
                                {course.flags > 0 && (
                                  <Badge className="bg-red-100 text-red-800">
                                    <Flag className="w-3 h-3 mr-1" />
                                    {course.flags} жалоб
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{course.price.toLocaleString()} ₸</p>
                            <p className="text-sm text-gray-500">
                              Подан: {new Date(course.submittedDate).toLocaleDateString("ru-RU")}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{course.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Продолжительность:</span>
                            <p className="font-medium">{course.duration}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Уроков:</span>
                            <p className="font-medium">{course.lessons}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Видео:</span>
                            <p className="font-medium">{course.content.videos}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Документов:</span>
                            <p className="font-medium">{course.content.documents}</p>
                          </div>
                        </div>

                        {course.flags > 0 && course.flagReason && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                            <p className="text-sm text-red-800">
                              <strong>Причина жалоб:</strong> {course.flagReason}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Просмотреть курс
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Одобрить
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <XCircle className="w-4 h-4 mr-1" />
                            Отклонить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Responses Moderation */}
                <TabsContent value="responses" className="space-y-6 mt-6">
                  {pendingResponses.map((response) => (
                    <Card key={response.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={response.authorAvatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {response.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold mb-1">{response.author}</h4>
                              <p className="text-sm text-gray-600 mb-2">Отзыв на курс: {response.courseTitle}</p>
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusBadge(response.status)}
                                <div className="flex items-center gap-1">
                                  {renderStars(response.rating)}
                                  <span className="text-sm text-gray-600 ml-1">({response.rating}/5)</span>
                                </div>
                                {response.flags > 0 && (
                                  <Badge className="bg-red-100 text-red-800">
                                    <Flag className="w-3 h-3 mr-1" />
                                    {response.flags} жалоб
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(response.submittedDate).toLocaleDateString("ru-RU")}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <p className="text-gray-800">{response.comment}</p>
                        </div>

                        {response.flags > 0 && response.flagReason && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                            <p className="text-sm text-red-800">
                              <strong>Причина жалоб:</strong> {response.flagReason}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Просмотреть курс
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Одобрить
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <XCircle className="w-4 h-4 mr-1" />
                            Удалить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
