"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Loader2, UserCheck } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAdminExecutorLeads } from "@/hooks/use-swr-hooks"
import { approveExecutorLead, rejectExecutorLead } from "@/lib/api"
import { toast } from "sonner"
import type { ExecutorLeadView } from "@/lib/api/types"

export default function AdminModerationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState<string | undefined>("new")
  const { data, isLoading, mutate } = useAdminExecutorLeads({ page: 1, pageSize: 50, status })
  const [actingId, setActingId] = useState<string | null>(null)

  const leads =
    data?.items.filter((lead) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        lead.email?.toLowerCase().includes(q) ||
        `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.toLowerCase().includes(q)
      )
    }) ?? []

  const handleApprove = async (lead: ExecutorLeadView) => {
    setActingId(lead.id)
    try {
      await approveExecutorLead(lead.id)
      toast.success("Заявка одобрена")
      mutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка одобрения")
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async (lead: ExecutorLeadView) => {
    setActingId(lead.id)
    try {
      await rejectExecutorLead(lead.id, "Не прошёл проверку документов")
      toast.success("Заявка отклонена")
      mutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка отклонения")
    } finally {
      setActingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2">Модерация исполнителей</h1>
          <p className="text-gray-600 mb-6">Заявки на регистрацию с документами</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Input
              placeholder="Поиск по email или имени..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            {(["new", "in_review", "approved", "rejected"] as const).map((s) => (
              <Button
                key={s}
                variant={status === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(s)}
              >
                {s}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">Нет заявок</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <UserCheck className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold">
                            {lead.first_name} {lead.last_name}
                          </h3>
                          <Badge variant="secondary">{lead.status ?? "new"}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                        <p className="text-sm text-gray-600">
                          {lead.city} · {lead.experience_level} · ИИН {lead.iin}
                        </p>
                        {lead.about && (
                          <p className="text-sm mt-2 line-clamp-2">{lead.about}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(lead.created_at).toLocaleString("ru-RU")}
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={actingId === lead.id}
                          onClick={() => handleApprove(lead)}
                        >
                          {actingId === lead.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actingId === lead.id}
                          onClick={() => handleReject(lead)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Отклонить
                        </Button>
                      </div>
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
