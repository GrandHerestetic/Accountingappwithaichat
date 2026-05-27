"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  DollarSign,
  Clock,
  CheckCircle,
  MessageCircle,
  Eye,
  Calendar,
  Target,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { getExecutorRating, listMyResponses } from "@/lib/api"
import type { OrderResponse } from "@/lib/api/types"

export default function ExecutorDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    rating: 0,
    activeOrders: 0,
    completedOrders: 0,
  })
  const [recentResponses, setRecentResponses] = useState<OrderResponse[]>([])

  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      try {
        const [rating, responses] = await Promise.all([
          getExecutorRating(user.id),
          listMyResponses({ page: 1, pageSize: 10 }),
        ])
        const active = responses.items.filter((r) =>
          ["submitted", "accepted", "payment_pending"].includes(r.status)
        ).length
        const completed = responses.items.filter((r) => r.status === "accepted").length
        setStats({
          rating: rating.avg_rating_total ?? 0,
          activeOrders: active,
          completedOrders: completed,
        })
        setRecentResponses(responses.items.slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Принят</Badge>
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800">Отправлен</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Черновик</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Отклонён</Badge>
      case "payment_pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Черновик</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
                      <p className="text-sm font-medium text-gray-600">Откликов</p>
                      <p className="text-2xl font-bold text-gray-900">{recentResponses.length}</p>
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
            <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Мои заказы</CardTitle>
                    <CardDescription>Текущие и недавние заказы</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentResponses.length === 0 && !loading && (
                        <p className="text-center text-sm text-gray-500 py-6">Пока нет откликов</p>
                      )}
                      {recentResponses.map((response) => (
                        <Card key={response.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">Заказ {response.order_id.slice(0, 8)}…</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{response.cover_letter}</p>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(response.status)}
                                  <span className="text-sm font-medium text-green-600">
                                    {response.proposed_amount.toLocaleString()} ₸
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link href={`/chat/${response.order_id}`}>
                                  <Button variant="outline" size="sm">
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Чат
                                  </Button>
                                </Link>
                                <Link href={`/executor/orders/${response.order_id}/response`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Детали
                                  </Button>
                                </Link>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                              <Calendar className="w-4 h-4" />
                              Срок:{" "}
                              {response.proposed_deadline
                                ? new Date(response.proposed_deadline).toLocaleDateString("ru-RU")
                                : "—"}
                            </div>
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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
