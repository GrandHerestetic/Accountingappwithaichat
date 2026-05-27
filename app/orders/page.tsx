"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  MessageCircle,
  Eye,
  Phone,
  Clock,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { listOrders } from "@/lib/api"
import type { Order, OrderStatus, PaginatedResponse } from "@/lib/api/types"
import { ORDER_CATEGORIES, ORDER_CATEGORY_LABELS } from "@/lib/order-categories"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Status badge colors per requirement 3.8
// ---------------------------------------------------------------------------
const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  payment_pending: "bg-yellow-100 text-yellow-700",
  published: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  archived: "bg-slate-100 text-slate-700",
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Черновик",
  payment_pending: "Черновик",
  published: "Опубликован",
  in_progress: "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
  archived: "В архиве",
}

const CATEGORIES = ["Все категории", ...ORDER_CATEGORIES.map((c) => c.slug)]

const CATEGORY_LABELS: Record<string, string> = {
  "Все категории": "Все категории",
  ...ORDER_CATEGORY_LABELS,
}

export default function PublicOrders() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PAGE_SIZE = 20

  // ---------------------------------------------------------------------------
  // Fetch orders from the API
  // ---------------------------------------------------------------------------
  const fetchOrders = useCallback(async (currentPage: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(currentPage))
      params.set("page_size", String(PAGE_SIZE))
      if (selectedCategory && selectedCategory !== "Все категории") {
        params.set("category", selectedCategory)
      }
      if (budgetMin) params.set("budget_min", budgetMin)
      if (budgetMax) params.set("budget_max", budgetMax)
      if (searchQuery.trim()) params.set("q", searchQuery.trim())

      const data = await listOrders({
        page: currentPage,
        pageSize: PAGE_SIZE,
        category:
          selectedCategory && selectedCategory !== "Все категории" ? selectedCategory : undefined,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        q: searchQuery.trim() || undefined,
      })
      setOrders(data.items)
      setTotal(data.total)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось загрузить заказы"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, budgetMin, budgetMax, searchQuery])

  useEffect(() => {
    fetchOrders(page)
  }, [fetchOrders, page])

  const handleSearch = () => {
    setPage(1)
    fetchOrders(1)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setBudgetMin("")
    setBudgetMax("")
    setPage(1)
  }

  const handleResponseClick = (orderId: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
    } else if (user?.role !== "executor") {
      toast.error("Только исполнители могут откликаться на заказы")
    } else {
      window.location.href = `/executor/orders/${orderId}/response`
    }
  }

  const handleContactClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
    } else if (user?.role !== "executor") {
      toast.error("Только исполнители могут получать контакты заказчиков")
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Все заказы на платформе</h1>
            <p className="text-gray-600 mb-4">
              {isAuthenticated && user?.role === "executor"
                ? "Найдите подходящие проекты и откликнитесь на них"
                : "Просматривайте доступные заказы"}
            </p>

            {isAuthenticated && user?.role === "executor" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-green-900">
                      Добро пожаловать! Вы можете откликаться на заказы и получать контакты заказчиков.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Link href="/executor/dashboard">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Мой кабинет
                        </Button>
                      </Link>
                      <Link href="/executor/orders">
                        <Button size="sm" variant="outline">
                          Поиск заказов
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по заказам..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] ?? cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    placeholder="Бюджет от"
                    type="number"
                    min={0}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                  <Input
                    placeholder="до"
                    type="number"
                    min={0}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Найти
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {loading ? "Загрузка..." : `Найдено ${total} заказов`}
            </p>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Сбросить фильтры
            </Button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Orders List */}
          {!loading && (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{order.title}</h3>
                          <Badge className={ORDER_STATUS_COLORS[order.status]}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {order.budget_amount.toLocaleString("ru-RU")} ₸
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString("ru-RU")}
                          </span>
                        </div>

                        <Badge variant="outline" className="mb-3">
                          {order.category_slug
                            ? (CATEGORY_LABELS[order.category_slug] ?? order.category_slug)
                            : "Без категории"}
                        </Badge>

                        <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">{order.description}</p>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                      </div>

                      <div className="ml-6 space-y-3">
                        <div className="space-y-2">
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleResponseClick(order.id)}
                            disabled={!isAuthenticated || user?.role !== "executor"}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Откликнуться
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleContactClick}
                            disabled={!isAuthenticated || user?.role !== "executor"}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Контакты
                          </Button>

                          <Button variant="ghost" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Подробнее
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && orders.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Заказы не найдены</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры поиска или проверьте позже</p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Назад
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Страница {page} из {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Вперёд
              </Button>
            </div>
          )}

          {/* Tips for Executors */}
          {isAuthenticated && user?.role === "executor" && (
            <Card className="mt-8 bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-green-900 mb-3">💡 Советы для успешных откликов:</h3>
                <div className="grid gap-4 md:grid-cols-2 text-sm text-green-800">
                  <div>
                    <h4 className="font-medium mb-2">Качественный отклик:</h4>
                    <ul className="space-y-1">
                      <li>• Внимательно читайте требования</li>
                      <li>• Указывайте конкретные сроки</li>
                      <li>• Прикрепляйте примеры работ</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Повышение рейтинга:</h4>
                    <ul className="space-y-1">
                      <li>• Отвечайте быстро на сообщения</li>
                      <li>• Соблюдайте сроки выполнения</li>
                      <li>• Поддерживайте профессиональное общение</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Auth Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Требуется авторизация</DialogTitle>
              <DialogDescription>
                Для отклика на заказы необходимо зарегистрироваться как исполнитель
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Зарегистрируйтесь как исполнитель, чтобы получить доступ к откликам на заказы и контактам заказчиков.
              </p>
              <div className="flex gap-3">
                <Link href="/executor/register" className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Стать исполнителем</Button>
                </Link>
                <Link href="/auth/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Войти
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
