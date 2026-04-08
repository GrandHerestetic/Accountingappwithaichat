"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Eye,
  Calendar,
  Award,
  Target,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function ExecutorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user } = useAuth()

  // Mock data
  const stats = {
    rating: 4.7,
    totalEarnings: 125000,
    activeOrders: 2,
    completedOrders: 18,
    responseRate: 85,
    profileViews: 234,
  }

  const recentOrders = [
    {
      id: 1,
      title: "Ведение бухгалтерского учета для ТОО",
      client: "ТОО 'Алматы Строй'",
      status: "in_progress",
      budget: "50000 ₸",
      deadline: "2024-02-15",
      progress: 65,
    },
    {
      id: 2,
      title: "Налоговое консультирование по НДС",
      client: "ИП Сериков А.Б.",
      status: "completed",
      budget: "25000 ₸",
      completedAt: "2024-01-20",
      rating: 5,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">В работе</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Завершен</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Ожидает</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={["executor"]}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать, {user?.profile?.profile_name ?? user?.email}! 👋</h1>
                <p className="text-gray-600">Управляйте заказами и отслеживайте статистику</p>
              </div>
              <Link href="/executor/orders">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Target className="w-4 h-4 mr-2" />
                  Найти заказы
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Рейтинг</p>
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Заработано</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalEarnings.toLocaleString()} ₸</p>
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
                      <p className="text-sm font-medium text-gray-600">В работе</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Завершено</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column - Orders */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Мои заказы</CardTitle>
                    <CardDescription>Текущие и недавние заказы</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{order.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">Заказчик: {order.client}</p>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(order.status)}
                                  <span className="text-sm font-medium text-green-600">{order.budget}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                {order.status === "in_progress" && (
                                  <div className="mb-2">
                                    <p className="text-xs text-gray-500 mb-1">Прогресс: {order.progress}%</p>
                                    <Progress value={order.progress} className="w-20" />
                                  </div>
                                )}
                                {order.status === "completed" && order.rating && (
                                  <div className="flex items-center gap-1 mb-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm">{order.rating}</span>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Link href={`/chat/${order.id}`}>
                                    <Button variant="outline" size="sm">
                                      <MessageCircle className="w-4 h-4 mr-1" />
                                      Чат
                                    </Button>
                                  </Link>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Детали
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {order.status === "in_progress" && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                До {new Date(order.deadline).toLocaleDateString("ru-RU")}
                              </div>
                            )}
                            {order.status === "completed" && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4" />
                                Завершен {new Date(order.completedAt!).toLocaleDateString("ru-RU")}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Link href="/executor/orders">
                        <Button variant="outline">Найти новые заказы</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Profile & Stats */}
              <div className="space-y-6">
                {/* Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Профиль
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-3">
                        <AvatarImage src={user?.profile?.avatar_url || "/placeholder.svg?height=80&width=80"} />
                        <AvatarFallback>
                          {(user?.profile?.profile_name ?? user?.email ?? "U")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold">{user?.profile?.profile_name ?? user?.email}</h3>
                      <p className="text-sm text-gray-600">Бухгалтер-консультант</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{stats.rating}</span>
                        <span className="text-sm text-gray-500">({stats.completedOrders} отзывов)</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Просмотры профиля</span>
                        <span className="font-medium">{stats.profileViews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Скорость ответа</span>
                        <span className="font-medium">{stats.responseRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Успешность заказов</span>
                        <span className="font-medium">95%</span>
                      </div>
                    </div>

                    <Link href="/profile">
                      <Button className="w-full" variant="outline">
                        Редактировать профиль
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Performance Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Производительность
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Заполненность профиля</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <Progress value={85} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Активность</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Качество работы</span>
                        <span className="text-sm font-medium">96%</span>
                      </div>
                      <Progress value={96} />
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Достижения
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Star className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Топ исполнитель</p>
                          <p className="text-xs text-gray-600">Рейтинг выше 4.5</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Надежный партнер</p>
                          <p className="text-xs text-gray-600">10+ успешных заказов</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Быстрый отклик</p>
                          <p className="text-xs text-gray-600">Ответ в течение часа</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warning Card (if rating is low) */}
                {stats.rating < 3.0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-5 h-5" />
                        Внимание!
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-700 mb-3">
                        Ваш рейтинг критически низкий. Необходимо улучшить качество работы.
                      </p>
                      <Link href="/executor/rating-warning">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          Подробнее
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
