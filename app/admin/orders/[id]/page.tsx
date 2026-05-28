"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  DollarSign,
  Eye,
  Loader2,
  MessageCircle,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrder, listClientOrderResponses } from "@/lib/api"
import type { Order, OrderResponse, OrderStatus } from "@/lib/api/types"
import { orderCategoryLabel } from "@/lib/order-categories"
import { toast } from "sonner"

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Черновик",
  payment_pending: "Ожидает оплаты",
  published: "Опубликован",
  in_progress: "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
  archived: "В архиве",
}

const RESPONSE_STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  payment_pending: "Ожидает оплаты",
  submitted: "Отправлен",
  accepted: "Принят",
  rejected: "Отклонён",
  cancelled: "Отменён",
}

function AdminOrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [responses, setResponses] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const [orderData, responsesData] = await Promise.all([
        getOrder(orderId),
        listClientOrderResponses(orderId).catch(() => ({ items: [] as OrderResponse[] })),
      ])
      setOrder(orderData)
      setResponses(
        (responsesData.items ?? []).filter((r) => r.is_paid === true || r.status === "submitted")
      )
    } catch (err) {
      setOrder(null)
      setNotFound(true)
      toast.error(err instanceof Error ? err.message : "Не удалось загрузить заказ")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

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
            Заказ удалён или недоступен. Проверьте ID в разделе «Управление заказами».
          </p>
          <Link href="/admin/orders">
            <Button>К списку заказов</Button>
          </Link>
        </div>
      </div>
    )
  }

  const categoryLabel = order.category_name ?? orderCategoryLabel(order.category_slug)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/admin/orders">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            К управлению заказами
          </Button>
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="text-2xl">{order.title}</CardTitle>
              <Badge variant="secondary">
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{order.description}</p>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4 shrink-0" />
                <span>
                  Бюджет: {order.budget_amount.toLocaleString("ru-RU")}{" "}
                  {order.currency ?? "KZT"}
                </span>
              </div>
              {categoryLabel ? (
                <div className="text-gray-600">Категория: {categoryLabel}</div>
              ) : null}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Создан: {new Date(order.created_at).toLocaleString("ru-RU")}</span>
              </div>
              {order.published_at ? (
                <div className="text-gray-600">
                  Опубликован: {new Date(order.published_at).toLocaleString("ru-RU")}
                </div>
              ) : null}
              {order.client_id ? (
                <div className="text-gray-600 sm:col-span-2">
                  ID заказчика: <code className="text-xs bg-muted px-1 rounded">{order.client_id}</code>
                </div>
              ) : null}
              <div className="text-gray-500 sm:col-span-2 text-xs">
                ID заказа: {order.id}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 border-t">
              <Link href={`/chat/${order.id}`}>
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Чат
                </Button>
              </Link>
              <Link href={`/orders/${order.id}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Публичный вид
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Отклики исполнителей</CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <p className="text-sm text-gray-500">Оплаченных или отправленных откликов нет</p>
            ) : (
              <ul className="space-y-3">
                {responses.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap justify-between gap-2 rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">
                        Исполнитель: {r.executor_id}
                      </p>
                      <p className="text-gray-600 line-clamp-2 mt-1">{r.cover_letter}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline">
                        {RESPONSE_STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                      <p className="mt-1 font-medium">
                        {r.proposed_amount?.toLocaleString("ru-RU")} ₸
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminOrderDetailContent orderId={params.id} />
    </ProtectedRoute>
  )
}
