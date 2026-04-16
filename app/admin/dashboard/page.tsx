"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Shield,
  MessageCircle,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user } = useAuth()

  // Mock data
  const platformStats = {
    totalUsers: 1247,
    activeOrders: 89,
    totalRevenue: 2450000,
    monthlyGrowth: 15.3,
    pendingVerifications: 23,
    activeDisputes: 7,
  }

  const recentActivity = [
    {
      type: "user_registration",
      message: "Новый заказчик зарегистрировался: ТОО 'Алматы Строй'",
      time: "5 минут назад",
      severity: "info",
    },
    {
      type: "dispute",
      message: "Новый спор по заказу #1234 требует рассмотрения",
      time: "15 минут назад",
      severity: "warning",
    },
    {
      type: "payment",
      message: "Платеж 25,000 ₸ успешно обработан",
      time: "1 час назад",
      severity: "success",
    },
    {
      type: "rating_drop",
      message: "Исполнитель Иванов И.И. получил рейтинг ниже 3★",
      time: "2 часа назад",
      severity: "error",
    },
  ]

  const pendingActions = [
    {
      id: 1,
      type: "verification",
      title: "Верификация документов",
      description: "ИП Сериков А.Б. ожидает проверки документов",
      priority: "high",
      daysWaiting: 2,
    },
    {
      id: 2,
      type: "dispute",
      title: "Спор по заказу #1234",
      description: "Заказчик жалуется на качество работы исполнителя",
      priority: "urgent",
      daysWaiting: 1,
    },
    {
      id: 3,
      type: "course_review",
      title: "Модерация курса",
      description: "Новый курс 'Основы МСФО' ожидает одобрения",
      priority: "medium",
      daysWaiting: 3,
    },
  ]

  const userStats = {
    clients: 456,
    executors: 623,
    coaches: 89,
    admins: 12,
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Срочно</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">Высокий</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Средний</Badge>
      default:
        return <Badge variant="secondary">Низкий</Badge>
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <MessageCircle className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать, {user?.profile?.profile_name ?? user?.email}! 👋</h1>
                <p className="text-gray-600">Управление платформой BuhPro</p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/users">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Users className="w-4 h-4 mr-2" />
                    Пользователи
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Настройки
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                      <p className="text-2xl font-bold text-gray-900">{platformStats.totalUsers}</p>
                      <p className="text-xs text-green-600">+{platformStats.monthlyGrowth}% за месяц</p>
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
                      <p className="text-sm font-medium text-gray-600">Активные заказы</p>
                      <p className="text-2xl font-bold text-gray-900">{platformStats.activeOrders}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Общий доход</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {platformStats.totalRevenue.toLocaleString()} ₸
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Требуют внимания</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {platformStats.pendingVerifications + platformStats.activeDisputes}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column - Main Dashboard */}
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Управление платформой</CardTitle>
                    <CardDescription>Основные функции администрирования</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Обзор</TabsTrigger>
                        <TabsTrigger value="users">Пользователи</TabsTrigger>
                        <TabsTrigger value="orders">Заказы</TabsTrigger>
                        <TabsTrigger value="finance">Финансы</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-6 mt-6">
                        {/* User Distribution */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Распределение пользователей</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{userStats.clients}</p>
                                <p className="text-sm text-gray-600">Заказчики</p>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{userStats.executors}</p>
                                <p className="text-sm text-gray-600">Исполнители</p>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">{userStats.coaches}</p>
                                <p className="text-sm text-gray-600">Коучи</p>
                              </div>
                              <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <p className="text-2xl font-bold text-orange-600">{userStats.admins}</p>
                                <p className="text-sm text-gray-600">Администраторы</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Быстрые действия</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-4">
                            <Link href="/admin/moderation">
                              <Button variant="outline" className="w-full justify-start">
                                <Shield className="w-4 h-4 mr-2" />
                                Модерация ({platformStats.pendingVerifications})
                              </Button>
                            </Link>
                            <Link href="/admin/disputes">
                              <Button variant="outline" className="w-full justify-start">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Споры ({platformStats.activeDisputes})
                              </Button>
                            </Link>
                            <Link href="/admin/analytics">
                              <Button variant="outline" className="w-full justify-start">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Аналитика
                              </Button>
                            </Link>
                            <Link href="/settings">
                              <Button variant="outline" className="w-full justify-start">
                                <Settings className="w-4 h-4 mr-2" />
                                Настройки тарифов
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="users" className="space-y-4 mt-6">
                        <div className="text-center py-8">
                          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Управление пользователями</h3>
                          <p className="text-gray-600 mb-6">
                            Просматривайте, модерируйте и управляйте всеми пользователями платформы
                          </p>
                          <Link href="/admin/users">
                            <Button className="bg-orange-600 hover:bg-orange-700">
                              Перейти к управлению пользователями
                            </Button>
                          </Link>
                        </div>
                      </TabsContent>

                      <TabsContent value="orders" className="space-y-4 mt-6">
                        <div className="text-center py-8">
                          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Управление заказами</h3>
                          <p className="text-gray-600 mb-6">
                            Модерируйте заказы, отслеживайте выполнение и разрешайте споры
                          </p>
                          <Link href="/admin/orders">
                            <Button className="bg-orange-600 hover:bg-orange-700">Перейти к заказам</Button>
                          </Link>
                        </div>
                      </TabsContent>

                      <TabsContent value="finance" className="space-y-4 mt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Доходы платформы</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span>Комиссия с заказов:</span>
                                  <span className="font-bold">1,250,000 ₸</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Продвижение заказов:</span>
                                  <span className="font-bold">890,000 ₸</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Отклики исполнителей:</span>
                                  <span className="font-bold">310,000 ₸</span>
                                </div>
                                <hr />
                                <div className="flex justify-between font-bold">
                                  <span>Итого:</span>
                                  <span className="text-green-600">2,450,000 ₸</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Транзакции</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <span>Успешные платежи:</span>
                                  <span className="text-green-600 font-medium">1,234</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Отклоненные платежи:</span>
                                  <span className="text-red-600 font-medium">23</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Возвраты:</span>
                                  <span className="text-yellow-600 font-medium">12</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Activity & Actions */}
              <div className="space-y-8">
                {/* Pending Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Требуют действий
                    </CardTitle>
                    <CardDescription>Задачи, ожидающие вашего внимания</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingActions.map((action) => (
                      <div key={action.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{action.title}</h4>
                          {getPriorityBadge(action.priority)}
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{action.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Ожидает {action.daysWaiting} дн.</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                              Действие
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Последняя активность</CardTitle>
                    <CardDescription>События на платформе в реальном времени</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {getSeverityIcon(activity.severity)}
                          <div className="flex-1">
                            <p className="text-sm">{activity.message}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle>Состояние системы</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Сервер:</span>
                      <Badge className="bg-green-100 text-green-800">Работает</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">База данных:</span>
                      <Badge className="bg-green-100 text-green-800">Работает</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Платежи:</span>
                      <Badge className="bg-green-100 text-green-800">Работает</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email:</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Задержка</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
