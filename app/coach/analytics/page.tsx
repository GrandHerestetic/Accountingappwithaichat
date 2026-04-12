"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Users, DollarSign, BookOpen, Star, Download, Eye, Award, Briefcase } from "lucide-react"
import Link from "next/link"

export default function CoachAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30d")

  const analyticsData = {
    overview: {
      totalRevenue: 354000,
      totalStudents: 156,
      totalCourses: 8,
      avgRating: 4.8,
      revenueGrowth: 23.5,
      studentsGrowth: 18.2,
      coursesGrowth: 12.5,
      ratingGrowth: 2.1,
    },
    coursePerformance: [
      {
        id: 1,
        title: "Основы налогового учета",
        students: 89,
        revenue: 156000,
        rating: 4.8,
        completionRate: 92,
        views: 1250,
        enrollments: 89,
        refunds: 2,
      },
      {
        id: 2,
        title: "МСФО для малого бизнеса",
        students: 67,
        revenue: 198000,
        rating: 4.9,
        completionRate: 85,
        views: 890,
        enrollments: 67,
        refunds: 1,
      },
    ],
    monthlyData: [
      { month: "Янв", revenue: 45000, students: 12, courses: 1 },
      { month: "Фев", revenue: 67000, students: 18, courses: 2 },
      { month: "Мар", revenue: 89000, students: 25, courses: 3 },
      { month: "Апр", revenue: 123000, students: 34, courses: 4 },
      { month: "Май", revenue: 156000, students: 45, courses: 5 },
      { month: "Июн", revenue: 189000, students: 56, courses: 6 },
    ],
    studentEngagement: {
      averageWatchTime: "45 мин",
      completionRate: 88,
      certificatesIssued: 134,
      activeStudents: 78,
    },
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
          <Link
            href="/coach/students"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Студенты
          </Link>
          <Link href="/coach/analytics" className="text-sm font-medium text-purple-600">
            Аналитика
          </Link>
        </nav>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
              <p className="text-gray-600">Подробная статистика ваших курсов и студентов</p>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Последние 7 дней</SelectItem>
                  <SelectItem value="30d">Последние 30 дней</SelectItem>
                  <SelectItem value="90d">Последние 3 месяца</SelectItem>
                  <SelectItem value="1y">Последний год</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Общий доход</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.overview.totalRevenue.toLocaleString()} ₸
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">+{analyticsData.overview.revenueGrowth}%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего студентов</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalStudents}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600">+{analyticsData.overview.studentsGrowth}%</span>
                    </div>
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
                    <p className="text-sm font-medium text-gray-600">Курсов создано</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalCourses}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-purple-500" />
                      <span className="text-xs text-purple-600">+{analyticsData.overview.coursesGrowth}%</span>
                    </div>
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
                    <p className="text-sm font-medium text-gray-600">Средний рейтинг</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgRating}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-600">+{analyticsData.overview.ratingGrowth}%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Обзор</TabsTrigger>
                  <TabsTrigger value="courses">Курсы</TabsTrigger>
                  <TabsTrigger value="students">Студенты</TabsTrigger>
                  <TabsTrigger value="revenue">Доходы</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Revenue Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Динамика доходов</CardTitle>
                        <CardDescription>Доходы по месяцам</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-end justify-between gap-2">
                          {analyticsData.monthlyData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                              <div
                                className="bg-purple-600 rounded-t w-full"
                                style={{
                                  height: `${(data.revenue / 200000) * 200}px`,
                                  minHeight: "20px",
                                }}
                              ></div>
                              <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Student Engagement */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Вовлеченность студентов</CardTitle>
                        <CardDescription>Ключевые метрики активности</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Среднее время просмотра:</span>
                          <span className="font-medium">{analyticsData.studentEngagement.averageWatchTime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Процент завершения:</span>
                          <span className="font-medium">{analyticsData.studentEngagement.completionRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Сертификатов выдано:</span>
                          <span className="font-medium">{analyticsData.studentEngagement.certificatesIssued}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Активных студентов:</span>
                          <span className="font-medium">{analyticsData.studentEngagement.activeStudents}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Performing Courses */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Лучшие курсы</CardTitle>
                      <CardDescription>Курсы с наивысшими показателями</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.coursePerformance.map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{course.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>{course.students} студентов</span>
                                <span>★ {course.rating}</span>
                                <span>{course.completionRate}% завершений</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{course.revenue.toLocaleString()} ₸</p>
                              <p className="text-sm text-gray-500">{course.views} просмотров</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="courses" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    {analyticsData.coursePerformance.map((course) => (
                      <Card key={course.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{course.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>{course.students} студентов</span>
                                <span>★ {course.rating}</span>
                                <span>{course.views} просмотров</span>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">{course.revenue.toLocaleString()} ₸</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span className="font-bold text-blue-600">{course.views}</span>
                              </div>
                              <p className="text-xs text-gray-600">Просмотры</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-green-600">{course.enrollments}</span>
                              </div>
                              <p className="text-xs text-gray-600">Записи</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Award className="w-4 h-4 text-purple-600" />
                                <span className="font-bold text-purple-600">{course.completionRate}%</span>
                              </div>
                              <p className="text-xs text-gray-600">Завершения</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="font-bold text-red-600">{course.refunds}</span>
                              </div>
                              <p className="text-xs text-gray-600">Возвраты</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="students" className="space-y-6 mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Рост студентов</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-end justify-between gap-2">
                          {analyticsData.monthlyData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                              <div
                                className="bg-blue-600 rounded-t w-full"
                                style={{
                                  height: `${(data.students / 60) * 200}px`,
                                  minHeight: "20px",
                                }}
                              ></div>
                              <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Активность студентов</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Активные студенты</span>
                            <span>78 из 156</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: "50%" }}></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Завершили курсы</span>
                            <span>134 из 156</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: "86%" }}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-6 mt-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Доход за месяц</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-600">89,000 ₸</p>
                        <p className="text-sm text-gray-600">+23% к прошлому месяцу</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Средний доход с курса</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-purple-600">44,250 ₸</p>
                        <p className="text-sm text-gray-600">За последние 30 дней</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Конверсия</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-blue-600">7.1%</p>
                        <p className="text-sm text-gray-600">Просмотры → Покупки</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Детализация доходов</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.coursePerformance.map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{course.title}</h4>
                              <p className="text-sm text-gray-600">{course.students} продаж</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{course.revenue.toLocaleString()} ₸</p>
                              <p className="text-sm text-gray-500">
                                {Math.round(course.revenue / course.students).toLocaleString()} ₸ за продажу
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
