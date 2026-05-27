"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  Loader2,
  MessageCircle,
  MapPin,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMyOrderDetails } from "@/lib/api"
import type { Order, OrderStatus } from "@/lib/api/types"
import { orderCategoryLabel } from "@/lib/order-categories"
import { toast } from "sonner"

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Черновик",
  payment_pending: "Черновик",
  published: "Опубликован",
  in_progress: "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
  archived: "В архиве",
}

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  payment_pending: "bg-yellow-100 text-yellow-700",
  published: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  archived: "bg-slate-100 text-slate-700",
}

function ClientOrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const data = await getMyOrderDetails(orderId)
        setOrder(data.order)
      } catch (err) {
        setOrder(null)
        setNotFound(true)
        toast.error(err instanceof Error ? err.message : "Не удалось загрузить заказ")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!order || notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center max-w-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Заказ не найден</h1>
          <p className="text-gray-600 mb-6">
            Заказ не существует или у вас нет доступа к нему. Проверьте список заказов в личном
            кабинете.
          </p>
          <Link href="/client/dashboard">
            <Button>К моим заказам</Button>
          </Link>
        </div>
      </div>
    )
  }

  const categoryLabel = order.category_name ?? orderCategoryLabel(order.category_slug)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/client/dashboard">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              К моим заказам
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle className="text-2xl">{order.title}</CardTitle>
                <Badge className={ORDER_STATUS_COLORS[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{order.description}</p>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span>
                    Бюджет: {order.budget_amount.toLocaleString("ru-RU")} {order.currency ?? "KZT"}
                  </span>
                </div>
                {categoryLabel ? (
                  <div className="text-gray-600">Категория: {categoryLabel}</div>
                ) : null}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Создан: {new Date(order.created_at).toLocaleDateString("ru-RU")}</span>
                </div>
                {order.published_at ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>
                      Опубликован: {new Date(order.published_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3 pt-2 border-t">
                {(order.status === "published" || order.status === "in_progress") && (
                  <Link href={`/client/order/${order.id}/responses`}>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Отклики
                    </Button>
                  </Link>
                )}
                {(order.status === "in_progress" || order.status === "completed") && (
                  <>
                    <Link href={`/chat/${order.id}`}>
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Чат
                      </Button>
                    </Link>
                    <Link href={`/client/order/${order.id}/complete`}>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {order.status === "completed" ? "Отзыв" : "Завершить заказ"}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ClientOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <ClientOrderDetailContent orderId={params.id} />
    </ProtectedRoute>
  )
}
