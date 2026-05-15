"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  DollarSign,
  MessageCircle,
  Eye,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { useOrders } from "@/hooks/use-swr-hooks"
import { useAuth } from "@/contexts/auth-context"
import type { Order } from "@/lib/api/types"

export default function ExecutorOrders() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const { user } = useAuth()
  const { data, isLoading, error } = useOrders({
    page: 1,
    pageSize: 50,
    q: searchQuery || undefined,
    category: selectedCategory && selectedCategory !== "Все категории" ? selectedCategory : undefined,
  })
  const orders: Order[] = data?.items ?? []

  const categories = [
    "Все категории",
    "Бухгалтерский учет",
    "Налоговое консультирование",
    "Аудиторские услуги",
    "Финансовый анализ",
    "Восстановление учета",
    "Подготовка отчетности",
  ]

  const locations = ["Все города", "Алматы", "Нур-Султан", "Шымкент", "Караганда", "Удаленно"]

  const filteredOrders = useMemo(() => {
    return [...orders]
      .filter((order) => {
        if (!selectedLocation || selectedLocation === "Все города") return true
        return order.description?.toLowerCase().includes(selectedLocation.toLowerCase())
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "budget_high":
            return b.budget_amount - a.budget_amount
          case "budget_low":
            return a.budget_amount - b.budget_amount
          case "newest":
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })
  }, [orders, selectedLocation, sortBy])

  const handleResponseClick = (orderId: string) => {
    // Перенаправляем на страницу отклика
    window.location.href = `/executor/orders/${orderId}/response`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <Navigation userType="executor" userName={user?.profile?.profile_name ?? user?.email ?? ""} notifications={0} />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Поиск заказов</h1>
              <p className="text-gray-600">Найдите подходящие проекты и откликнитесь на них</p>
            </div>
            <Link href="/executor/dashboard">
              <Button variant="outline">Вернуться в кабинет</Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Фильтры поиска
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по заказам..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Город" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button className="bg-green-600 hover:bg-green-700">
                  <Search className="w-4 h-4 mr-2" />
                  Найти
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Найдено {filteredOrders.length} заказов</p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Сначала новые</SelectItem>
                <SelectItem value="budget_high">Бюджет: по убыванию</SelectItem>
                <SelectItem value="budget_low">Бюджет: по возрастанию</SelectItem>
                <SelectItem value="deadline">По дедлайну</SelectItem>
                <SelectItem value="responses">По откликам</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading && <p className="text-gray-600 mb-4">Загрузка заказов…</p>}
          {error && <p className="text-red-600 mb-4">Не удалось загрузить заказы</p>}

          {/* Orders List */}
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold mb-2">{order.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {order.budget_amount.toLocaleString("ru-RU")} {order.currency ?? "₸"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(order.created_at).toLocaleDateString("ru-RU")}
                        </span>
                        <Badge variant="secondary">{order.status}</Badge>
                      </div>
                      {(order.category_name || order.category_slug) && (
                        <Badge variant="outline" className="mb-3">
                          {order.category_name ?? order.category_slug}
                        </Badge>
                      )}
                      <p className="text-gray-700 leading-relaxed">{order.description}</p>
                    </div>
                    <div className="shrink-0 space-y-2">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleResponseClick(order.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Откликнуться
                      </Button>
                      <Link href={`/chat/${order.id}`}>
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Чат
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Заказы не найдены</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры поиска или проверьте позже</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("")
                    setSelectedLocation("")
                  }}
                >
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="mt-8 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-green-900 mb-3">💡 Советы для успешных откликов:</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Внимательно читайте описание заказа и требования</li>
                <li>• Указывайте конкретные сроки и стоимость в своем предложении</li>
                <li>• Прикрепляйте примеры своих работ или сертификаты</li>
                <li>• Отвечайте быстро - заказчики ценят оперативность</li>
                <li>• Поддерживайте высокий рейтинг для большего доверия</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
