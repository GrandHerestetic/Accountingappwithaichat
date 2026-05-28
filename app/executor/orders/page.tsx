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
  Flag,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Navigation } from "@/components/navigation"
import { listAllMyResponses, reportOrderAsExecutor } from "@/lib/api"
import { toast } from "sonner"
import { useOrders } from "@/hooks/use-swr-hooks"
import { useAuth } from "@/contexts/auth-context"
import type { Order, ResponseStatus } from "@/lib/api/types"

/** Заказы, где уже есть отклик (кроме отменённого — можно откликнуться снова). */
const ACTIVE_RESPONSE_STATUSES: ResponseStatus[] = [
  "draft",
  "payment_pending",
  "submitted",
  "accepted",
  "rejected",
]

export default function ExecutorOrders() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [reportOrder, setReportOrder] = useState<Order | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  const { user } = useAuth()
  const { data, isLoading, error } = useOrders({
    page: 1,
    pageSize: 50,
    q: searchQuery || undefined,
    category: selectedCategory && selectedCategory !== "Все категории" ? selectedCategory : undefined,
  })
  const { data: myResponseItems } = useSWR(
    user?.role === "executor" ? ["my-responses", "job-search"] : null,
    listAllMyResponses
  )
  const orders: Order[] = data?.items ?? []

  const respondedOrderIds = useMemo(() => {
    const ids = new Set<string>()
    for (const r of myResponseItems ?? []) {
      if (ACTIVE_RESPONSE_STATUSES.includes(r.status)) {
        ids.add(r.order_id)
      }
    }
    return ids
  }, [myResponseItems])

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
      .filter((order) => !respondedOrderIds.has(order.id))
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
  }, [orders, respondedOrderIds, selectedLocation, sortBy])

  const handleResponseClick = (orderId: string) => {
    router.push(`/executor/orders/${orderId}/response`)
  }

  const openReportDialog = (order: Order) => {
    setReportOrder(order)
    setReportReason("")
    setReportError(null)
  }

  const handleReportSubmit = async () => {
    if (!reportOrder) return
    const reason = reportReason.trim()
    if (reason.length < 10) {
      const msg = "Опишите причину жалобы (минимум 10 символов)"
      setReportError(msg)
      toast.error(msg)
      return
    }
    setReportError(null)
    setReportLoading(true)
    try {
      const result = await reportOrderAsExecutor(reportOrder.id, reason)
      toast.success(result.message || "Жалоба отправлена администратору")
      setReportOrder(null)
      setReportReason("")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось отправить жалобу")
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <Navigation />

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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-gray-600">Найдено {filteredOrders.length} заказов</p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
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
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-2 text-lg font-semibold sm:text-xl">{order.title}</h3>
                      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-600 sm:gap-4">
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
                      <p className="text-gray-700 leading-relaxed break-words">{order.description}</p>
                    </div>
                    <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-56 sm:grid-cols-1">
                      <Button
                        className="col-span-2 w-full bg-green-600 hover:bg-green-700 sm:col-span-1"
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
                      <Button
                        variant="outline"
                        className="w-full border-amber-200 text-amber-800 hover:bg-amber-50"
                        onClick={() => openReportDialog(order)}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Пожаловаться
                      </Button>
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
              <h3 className="font-semibold text-green-900 mb-3">Советы для успешных откликов:</h3>
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

      <Dialog
        open={!!reportOrder}
        onOpenChange={(open) => {
          if (!open) {
            setReportOrder(null)
            setReportReason("")
            setReportError(null)
          }
        }}
      >
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleReportSubmit()
            }}
          >
            <DialogHeader>
              <DialogTitle>Пожаловаться на заказ</DialogTitle>
              <DialogDescription>
                {reportOrder && (
                  <>
                    «{reportOrder.title}» — жалоба уйдёт администратору в раздел «Управление
                    заказами».
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="report-reason">Причина *</Label>
              <Textarea
                id="report-reason"
                rows={4}
                placeholder="Опишите, что не так с заказом (спам, мошенничество, некорректное описание…)"
                value={reportReason}
                onChange={(e) => {
                  setReportReason(e.target.value)
                  if (reportError) setReportError(null)
                }}
                aria-invalid={!!reportError}
              />
              {reportError && (
                <p className="text-sm text-destructive" role="alert">
                  {reportError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Минимум 10 символов ({reportReason.trim().length}/10)
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReportOrder(null)
                  setReportReason("")
                  setReportError(null)
                }}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={reportLoading}
              >
                {reportLoading ? "Отправка…" : "Отправить жалобу"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
