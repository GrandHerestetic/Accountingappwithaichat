"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { listOrders } from "@/lib/api"
import type { Order } from "@/lib/api/types"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")

  useEffect(() => {
    listOrders({ page: 1, pageSize: 50, q: q || undefined })
      .then((data) => setOrders(data.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [q])

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Заказы платформы</h1>
          <Input
            placeholder="Поиск..."
            className="max-w-sm mb-6"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Card key={o.id}>
                  <CardContent className="p-4 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-medium">{o.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{o.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge>{o.status}</Badge>
                      <p className="text-sm font-medium mt-1">
                        {o.budget_amount?.toLocaleString()} {o.currency ?? "₸"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
