"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Loader2, Shield } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAdminSanctions } from "@/hooks/use-swr-hooks"
import { liftAdminSanction } from "@/lib/api"
import { toast } from "sonner"
import type { Sanction } from "@/lib/api/types"

export default function AdminModerationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const { data, isLoading, mutate } = useAdminSanctions({ page: 1, pageSize: 50 })
  const [actingId, setActingId] = useState<string | null>(null)

  const sanctions =
    data?.items.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        s.executor_id.toLowerCase().includes(q) ||
        (s.reason ?? "").toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      )
    }) ?? []

  const handleLift = async (sanction: Sanction) => {
    setActingId(sanction.id)
    try {
      await liftAdminSanction(sanction.id)
      toast.success("Санкция снята")
      mutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setActingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2">Модерация санкций</h1>
          <p className="text-gray-600 mb-6">
            Заявки исполнителей (leads) в API v2 отсутствуют — управление через санкции
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Input
              placeholder="Поиск по ID исполнителя или причине..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            {(["active", "lifted", "all"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === "active" ? "Активные" : s === "lifted" ? "Снятые" : "Все"}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : sanctions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">Нет санкций</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sanctions.map((sanction) => (
                <Card key={sanction.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold">{sanction.type}</h3>
                          <Badge variant={sanction.status === "active" ? "destructive" : "secondary"}>
                            {sanction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Исполнитель: {sanction.executor_id}</p>
                        {sanction.reason && (
                          <p className="text-sm mt-2 flex items-start gap-1">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            {sanction.reason}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(sanction.created_at).toLocaleString("ru-RU")}
                          {sanction.ends_at &&
                            ` · до ${new Date(sanction.ends_at).toLocaleDateString("ru-RU")}`}
                        </p>
                      </div>
                      {sanction.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actingId === sanction.id}
                          onClick={() => handleLift(sanction)}
                        >
                          {actingId === sanction.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Снять санкцию"
                          )}
                        </Button>
                      )}
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
