"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { listOrders } from "@/lib/api"
import type { Order } from "@/lib/api/types"

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listOrders({ page: 1, pageSize: 100 })
      .then((d) => setOrders(d.items))
      .finally(() => setLoading(false))
  }, [])

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  const totalBudget = orders.reduce((s, o) => s + (o.budget_amount ?? 0), 0)

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Аналитика</h1>
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Заказы по статусам</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span>{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {Object.keys(byStatus).length === 0 && (
                    <p className="text-gray-500 text-sm">Нет данных</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Суммарный бюджет заказов</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {totalBudget.toLocaleString()} ₸
                  </p>
                  <p className="text-sm text-gray-600 mt-2">По {orders.length} заказам в выборке</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
