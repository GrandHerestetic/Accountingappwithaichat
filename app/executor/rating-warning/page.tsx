"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  Star,
  TrendingDown,
  BookOpen,
  Clock,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Mail,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import {
  getExecutorRating,
  getExecutorReviews,
  listCourses,
  listMyCourseAssignments,
  listMySanctions,
} from "@/lib/api"
import type { Course, Sanction } from "@/lib/api/types"
import { COURSE_STATUS_LABELS } from "@/lib/course-utils"
import { isAssignmentActive } from "@/lib/course-utils"

export default function RatingWarningPage() {
  const { user } = useAuth()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [executorData, setExecutorData] = useState({
    name: "",
    currentRating: 0,
    previousRating: 0,
    recentRatings: [] as number[],
    blockEndDate: "",
    violationsCount: 0,
    ordersToImprove: 0,
  })
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([])

  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      try {
        const [rating, reviews, sanctions, courses, assignments] = await Promise.all([
          getExecutorRating(user.id),
          getExecutorReviews(user.id, { page: 1, pageSize: 10 }),
          listMySanctions({ page: 1, pageSize: 5 }),
          listCourses({ page: 1, pageSize: 3, status: "published" }),
          listMyCourseAssignments({ page: 1, pageSize: 10 }),
        ])
        const activeSanction = sanctions.items.find((s: Sanction) => s.status === "active")
        const ends = activeSanction?.ends_at ?? ""
        if (ends) {
          const diff = new Date(ends).getTime() - Date.now()
          if (diff > 0) {
            setTimeLeft({
              days: Math.floor(diff / 86400000),
              hours: Math.floor((diff % 86400000) / 3600000),
              minutes: Math.floor((diff % 3600000) / 60000),
            })
          }
        }
        setExecutorData({
          name: user.profile?.profile_name ?? user.email,
          currentRating: rating.avg_rating_recent,
          previousRating: rating.avg_rating_total,
          recentRatings: reviews.items.map((r) => r.rating),
          blockEndDate: ends,
          violationsCount: sanctions.items.filter((s) => s.status === "active").length,
          ordersToImprove: assignments.items.filter((a) => isAssignmentActive(a.status)).length,
        })
        setRecommendedCourses(courses.items)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [user])

  const improvementTips = [
    {
      icon: CheckCircle,
      title: "Внимательно читайте требования",
      description: "Изучайте техническое задание перед началом работы",
    },
    {
      icon: Clock,
      title: "Соблюдайте сроки",
      description: "Планируйте время и сдавайте работы вовремя",
    },
    {
      icon: MessageCircle,
      title: "Поддерживайте связь",
      description: "Регулярно информируйте заказчика о ходе работы",
    },
    {
      icon: Star,
      title: "Превышайте ожидания",
      description: "Делайте больше, чем требуется в техническом задании",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">BuhPro</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/executor/dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Дашборд
          </Link>
          <Link href="/courses" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Курсы
          </Link>
        </nav>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Warning Header */}
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-red-900 mb-2">Аккаунт временно заблокирован</h1>
                  <p className="text-red-800 mb-4">
                    Ваш рейтинг опустился ниже 3.0 звезд. Аккаунт заблокирован на 7 дней для улучшения качества услуг.
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-red-800">
                        Текущий рейтинг: <strong>{executorData.currentRating}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span className="text-red-800">
                        Разблокировка через:{" "}
                        <strong>
                          {timeLeft.days}д {timeLeft.hours}ч {timeLeft.minutes}м
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Analysis */}
          <div className="grid gap-8 lg:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Анализ рейтинга
                </CardTitle>
                <CardDescription>Динамика ваших оценок за последние 10 заказов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Текущий рейтинг:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-red-600">{executorData.currentRating}</span>
                      <Badge className="bg-red-100 text-red-800">Критический</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Предыдущий рейтинг:</span>
                    <span className="font-medium">{executorData.previousRating}</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Прогресс до разблокировки</span>
                      <span>Требуется: 3.0+</span>
                    </div>
                    <Progress value={(executorData.currentRating / 5) * 100} className="h-2" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Последние оценки:</p>
                    <div className="flex gap-1">
                      {executorData.recentRatings.map((rating, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                            rating >= 4
                              ? "bg-green-100 text-green-800"
                              : rating >= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rating}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статус блокировки</CardTitle>
                <CardDescription>Информация о текущих ограничениях</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Нарушений:</span>
                    <Badge variant="outline">{executorData.violationsCount} из 2</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Дата разблокировки:</span>
                    <span className="font-medium">
                      {new Date(executorData.blockEndDate).toLocaleDateString("ru-RU")}
                    </span>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Внимание:</strong> При повторном нарушении (рейтинг ниже 3.0) вы будете направлены на
                      обязательное обучение.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Для разблокировки:</strong> Пройдите рекомендуемые курсы и получите{" "}
                      {executorData.ordersToImprove} положительные оценки (4+ звезд).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Improvement Tips */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Рекомендации по улучшению</CardTitle>
              <CardDescription>Следуйте этим советам для повышения качества работы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {improvementTips.map((tip, index) => {
                  const Icon = tip.icon
                  return (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{tip.title}</h4>
                        <p className="text-sm text-gray-600">{tip.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Рекомендуемые курсы
              </CardTitle>
              <CardDescription>Пройдите эти курсы для улучшения профессиональных навыков</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedCourses.map((course) => (
                  <Card key={course.id} className="border-purple-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{course.title}</h4>
                            <Badge variant="outline" className="text-purple-600 border-purple-600">
                              {COURSE_STATUS_LABELS[course.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                          <p className="text-xs text-gray-500">
                            Добавлен: {new Date(course.created_at).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                        <Link href={`/courses/${course.id}`}>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            Начать курс
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-2">Преимущества обучения:</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Повышение профессиональных навыков</li>
                      <li>• Получение сертификатов для портфолио</li>
                      <li>• Увеличение шансов на получение заказов</li>
                      <li>• Скидка 20% на курсы для заблокированных пользователей</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Нужна помощь?</h3>
                  <p className="text-blue-800 mb-4">
                    Если у вас есть вопросы о блокировке или вы считаете, что оценки были поставлены несправедливо,
                    обратитесь в службу поддержки.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/support">
                      <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
                        Связаться с поддержкой
                      </Button>
                    </Link>
                    <Link href="/support/appeal">
                      <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
                        Подать апелляцию
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
