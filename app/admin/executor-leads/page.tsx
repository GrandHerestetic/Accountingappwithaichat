"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Loader2, UserCheck, XCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAdminExecutorLeads } from "@/hooks/use-swr-hooks"
import { approveExecutorLead, rejectExecutorLead } from "@/lib/api"
import { toast } from "sonner"
import type { ExecutorLeadView } from "@/lib/api/types"

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  in_review: "На проверке",
  approved: "Одобрена",
  rejected: "Отклонена",
  converted: "Аккаунт создан",
}

const STATUS_FILTER_OPTIONS = [
  { value: "new", label: "Новые" },
  { value: "in_review", label: "На проверке" },
  { value: "approved", label: "Одобренные" },
  { value: "rejected", label: "Отклонённые" },
  { value: "converted", label: "Созданные аккаунты" },
  { value: "", label: "Все" },
]

function canApprove(lead: ExecutorLeadView) {
  const s = lead.status ?? "new"
  return s === "new" || s === "in_review" || s === "approved"
}

function leadName(lead: ExecutorLeadView) {
  return [lead.first_name, lead.last_name].filter(Boolean).join(" ") || lead.email
}

export default function AdminExecutorLeadsPage() {
  const [statusFilter, setStatusFilter] = useState("new")
  const [searchQuery, setSearchQuery] = useState("")
  const [actingId, setActingId] = useState<string | null>(null)
  const [rejectLead, setRejectLead] = useState<ExecutorLeadView | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const { data, isLoading, mutate } = useAdminExecutorLeads({
    page: 1,
    pageSize: 50,
    status: statusFilter || undefined,
  })

  const leads =
    data?.items.filter((lead) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        lead.email.toLowerCase().includes(q) ||
        leadName(lead).toLowerCase().includes(q) ||
        (lead.city ?? "").toLowerCase().includes(q)
      )
    }) ?? []

  const handleApprove = async (lead: ExecutorLeadView) => {
    setActingId(lead.id)
    try {
      const result = await approveExecutorLead(lead.id)
      toast.success("Исполнитель создан. Теперь он может войти в систему.")
      if (result.user_id) {
        toast.info(`ID пользователя: ${result.user_id}`)
      }
      mutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось одобрить заявку")
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectLead) return
    const reason = rejectReason.trim()
    if (reason.length < 3) {
      toast.error("Укажите причину отклонения (минимум 3 символа)")
      return
    }
    setActingId(rejectLead.id)
    try {
      await rejectExecutorLead(rejectLead.id, reason)
      toast.success("Заявка отклонена")
      setRejectLead(null)
      setRejectReason("")
      mutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось отклонить заявку")
    } finally {
      setActingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-green-600" />
            Заявки исполнителей
          </h1>
          <p className="text-gray-600 mb-6">
            Одобрите заявку, чтобы создать аккаунт — только после этого исполнитель сможет войти
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Input
              placeholder="Поиск по email, имени, городу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Заявок с выбранным фильтром нет
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap justify-between gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{leadName(lead)}</h3>
                          <Badge variant="secondary">
                            {STATUS_LABELS[lead.status ?? "new"] ?? lead.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {lead.city && `${lead.city} · `}
                          {lead.created_at &&
                            new Date(lead.created_at).toLocaleString("ru-RU")}
                        </p>
                        {lead.specializations && lead.specializations.length > 0 && (
                          <p className="text-sm mt-2">
                            <span className="text-gray-500">Специализации: </span>
                            {lead.specializations.join(", ")}
                          </p>
                        )}
                        {lead.about && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{lead.about}</p>
                        )}
                        {lead.documents && lead.documents.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {lead.documents.map((doc) =>
                              doc.url ? (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {doc.document_type ?? doc.type ?? "документ"}
                                </a>
                              ) : null
                            )}
                          </div>
                        )}
                      </div>
                      {canApprove(lead) && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            disabled={actingId === lead.id}
                            onClick={() => handleApprove(lead)}
                          >
                            {actingId === lead.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Одобрить
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            disabled={actingId === lead.id}
                            onClick={() => {
                              setRejectLead(lead)
                              setRejectReason("")
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Отклонить
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!rejectLead} onOpenChange={(open) => !open && setRejectLead(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Отклонить заявку</DialogTitle>
              <DialogDescription>
                {rejectLead ? `${leadName(rejectLead)} (${rejectLead.email})` : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Причина *</Label>
              <Textarea
                id="reject-reason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Например: нечитаемые документы"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectLead(null)}>
                Отмена
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!!actingId}>
                Отклонить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
