"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, Calendar, DollarSign, Loader2, MessageCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrder, listMyOrderResponses } from "@/lib/api"
import type { Order, OrderResponse, OrderStatus, ResponseStatus } from "@/lib/api/types"
import { toast } from "sonner"

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Черновик",
  payment_pending: "Ожидает оплаты",
  published: "Опубликован",
  in_progress: "В работе",
  completed: "Завершен",
  cancelled: "Отменен",
  archived: "В архиве",
}

const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
  draft: "Черновик",
  payment_pending: "Ожидает оплаты",
  submitted: "Отправлен",
  accepted: "Принят",
  rejected: "Отклонен",
  cancelled: "Отменен",
}

function pickPrimaryResponse(items: OrderResponse[]): OrderResponse | null {
  if (!items.length) return null
  const priority: Record<ResponseStatus, number> = {
    accepted: 6,
    submitted: 5,
    payment_pending: 4,
    draft: 3,
    rejected: 2,
    cancelled: 1,
  }
  return [...items].sort((a, b) => (priority[b.status] ?? 0) - (priority[a.status] ?? 0))[0] ?? null
}

function ExecutorOrderDetailContent() {
  const params = useParams()
  const orderId = typeof params.id === "string" ? params.id : ""

  const [order, setOrder] = useState<Order | null>(null)
  const [responses, setResponses] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    const load = async () => {
      setLoading(true)
      try {
        const [orderData, myResponses] = await Promise.all([
          getOrder(orderId),
          listMyOrderResponses(orderId).catch(() => ({ items: [] as OrderResponse[] })),
        ])
        setOrder(orderData)
        setResponses(myResponses.items ?? [])
      } catch (err) {
        setOrder(null)
        setResponses([])
        toast.error(err instanceof Error ? err.message : "Не удалось загрузить заказ")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [orderId])

  const primaryResponse = useMemo(() => pickPrimaryResponse(responses), [responses])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center max-w-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Заказ недоступен</h1>
          <p className="text-gray-600 mb-6">
            У вас нет доступа к этому заказу или он был удален.
          </p>
          <Link href="/executor/responses">
            <Button>К моим откликам</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/executor/responses">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            К моим откликам
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="text-2xl">{order.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
                {primaryResponse && (
                  <Badge variant="outline">
                    Отклик: {RESPONSE_STATUS_LABELS[primaryResponse.status] ?? primaryResponse.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 whitespace-pre-wrap">{order.description}</p>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>
                  Бюджет: {order.budget_amount.toLocaleString("ru-RU")} {order.currency ?? "KZT"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Создан: {new Date(order.created_at).toLocaleDateString("ru-RU")}</span>
              </div>
            </div>

            {primaryResponse?.cover_letter ? (
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-sm font-medium mb-1">Ваш отклик</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{primaryResponse.cover_letter}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2 border-t">
              <Link href={`/chat/${order.id}`}>
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Открыть чат
                </Button>
              </Link>
              {(primaryResponse?.status === "draft" || primaryResponse?.status === "payment_pending") && (
                <Link href={`/executor/orders/${order.id}/response`}>
                  <Button className="bg-green-600 hover:bg-green-700">Редактировать отклик</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ExecutorOrderDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["executor"]}>
      <ExecutorOrderDetailContent />
    </ProtectedRoute>
  )
}
