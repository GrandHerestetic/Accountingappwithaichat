"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Calendar, DollarSign, Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { getOrder } from "@/lib/api"
import type { Order, OrderStatus } from "@/lib/api/types"
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrder(params.id)
        setOrder(data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Не удалось загрузить заказ")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  const respondHref =
    isAuthenticated && user?.role === "executor"
      ? `/executor/orders/${params.id}/response`
      : "/auth/login"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Заказ не найден</h1>
          <Link href="/orders">
            <Button>К списку заказов</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/orders">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к заказам
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="text-2xl">{order.title}</CardTitle>
              <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
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
              {order.category_name && (
                <div className="text-gray-600">Категория: {order.category_name}</div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Создан: {new Date(order.created_at).toLocaleDateString("ru-RU")}</span>
              </div>
            </div>

            {order.status === "published" && (
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => router.push(respondHref)}>Откликнуться</Button>
                <Link href={`/chat/${order.id}`}>
                  <Button variant="outline">Открыть чат</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
