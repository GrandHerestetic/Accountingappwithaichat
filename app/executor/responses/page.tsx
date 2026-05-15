"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Calendar, DollarSign, Pencil, Send, MessageCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import {
  cancelMyResponse,
  listMyResponses,
  submitMyResponse,
  updateMyResponse,
} from "@/lib/api"
import type { OrderResponse, ResponseStatus, PaginatedResponse } from "@/lib/api/types"

// ─── Req 4.8: distinct badge colors per response status ─────────────────────
const RESPONSE_STATUS_COLORS: Record<ResponseStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  payment_pending: "bg-yellow-100 text-yellow-700",
  submitted: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
}

const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
  draft: "Черновик",
  payment_pending: "Ожидает оплаты",
  submitted: "Отправлен",
  accepted: "Принят",
  rejected: "Отклонён",
  cancelled: "Отменён",
}

interface EditState {
  open: boolean
  response: OrderResponse | null
  amount: string
  deadline: string
  coverLetter: string
}

export default function ExecutorResponsesPage() {
  const [responses, setResponses] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page] = useState(1)

  // Edit draft dialog state (Req 4.3)
  const [editState, setEditState] = useState<EditState>({
    open: false,
    response: null,
    amount: "",
    deadline: "",
    coverLetter: "",
  })
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Submit for payment in-progress (Req 4.4)
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  // ── Req 4.2: fetch my responses ───────────────────────────────────────────
  const fetchResponses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await listMyResponses({ page, pageSize: 20 })
      setResponses(data.items)
    } catch (err: unknown) {
      // Req 4.9: error toast on API failure
      const message = err instanceof Error ? err.message : "Не удалось загрузить отклики"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  // ── Req 4.3: edit draft response ─────────────────────────────────────────
  const openEditDialog = (response: OrderResponse) => {
    setEditState({
      open: true,
      response,
      amount: String(response.proposed_amount),
      deadline: response.proposed_deadline.split("T")[0], // ISO date only
      coverLetter: response.cover_letter,
    })
  }

  const saveEdit = async () => {
    if (!editState.response) return

    const patch: Partial<{
      proposed_amount: number
      proposed_deadline: string
      cover_letter: string
    }> = {}

    const amountNum = parseFloat(editState.amount)
    if (!isNaN(amountNum) && amountNum !== editState.response.proposed_amount) {
      patch.proposed_amount = amountNum
    }
    if (editState.deadline && editState.deadline !== editState.response.proposed_deadline.split("T")[0]) {
      patch.proposed_deadline = editState.deadline
    }
    if (editState.coverLetter.trim() !== editState.response.cover_letter) {
      patch.cover_letter = editState.coverLetter.trim()
    }

    if (Object.keys(patch).length === 0) {
      setEditState((s) => ({ ...s, open: false }))
      return
    }

    setIsSavingEdit(true)
    try {
      await updateMyResponse(editState.response.order_id, editState.response.id, patch)
      toast.success("Отклик обновлён")
      setEditState((s) => ({ ...s, open: false }))
      await fetchResponses()
    } catch (err: unknown) {
      // Req 4.9: error toast on API failure
      const message = err instanceof Error ? err.message : "Не удалось обновить отклик"
      toast.error(message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  // ── Req 4.4: submit draft response for payment ────────────────────────────
  const handleSubmitForPayment = async (response: OrderResponse) => {
    setSubmittingId(response.id)
    try {
      const result = await submitMyResponse(response.order_id, response.id)
      if (result?.checkout_url) {
        window.open(result.checkout_url, "_blank")
      } else {
        toast.success("Отклик отправлен на оплату!")
        await fetchResponses()
      }
    } catch (err: unknown) {
      // Req 4.9: error toast on API failure
      const message = err instanceof Error ? err.message : "Не удалось отправить отклик на оплату"
      toast.error(message)
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["executor"]}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Мои отклики</h1>
                <p className="text-gray-600">Управляйте своими откликами на заказы</p>
              </div>
              <Link href="/executor/orders">
                <Button className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Найти заказы
                </Button>
              </Link>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
                <p className="mt-4 text-gray-600">Загрузка откликов...</p>
              </div>
            ) : (
              <>
                {/* Responses list */}
                <div className="space-y-4">
                  {responses.map((response) => (
                    <Card key={response.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          {/* Response info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Req 4.8: distinct status badge colors */}
                              <Badge className={RESPONSE_STATUS_COLORS[response.status]}>
                                {RESPONSE_STATUS_LABELS[response.status]}
                              </Badge>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(response.created_at).toLocaleDateString("ru-RU")}
                              </span>
                              {response.is_paid && (
                                <Badge className="bg-green-100 text-green-700">Оплачен</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Предложенная сумма:</span>
                                <p className="font-semibold text-green-600 text-lg flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {response.proposed_amount.toLocaleString()} ₸
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Срок выполнения:</span>
                                <p className="font-medium">
                                  {new Date(response.proposed_deadline).toLocaleDateString("ru-RU")}
                                </p>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700 line-clamp-3">{response.cover_letter}</p>
                            </div>

                            <p className="text-xs text-gray-400">Заказ ID: {response.order_id}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 min-w-[160px]">
                            {/* Req 4.3: edit draft */}
                            {response.status === "draft" && (
                              <>
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => openEditDialog(response)}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Редактировать
                                </Button>
                                {/* Req 4.4: submit draft for payment */}
                                <Button
                                  className="w-full bg-green-600 hover:bg-green-700"
                                  onClick={() => handleSubmitForPayment(response)}
                                  disabled={submittingId === response.id}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {submittingId === response.id ? "Отправка..." : "Отправить"}
                                </Button>
                              </>
                            )}
                            <Link href={`/executor/orders/${response.order_id}/response`}>
                              <Button variant="ghost" className="w-full text-sm">
                                Просмотр заказа
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty state */}
                {responses.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Нет откликов</h3>
                      <p className="text-gray-600 mb-6">
                        Вы ещё не откликались на заказы. Найдите подходящий заказ и отправьте отклик.
                      </p>
                      <Link href="/executor/orders">
                        <Button className="bg-green-600 hover:bg-green-700">Найти заказы</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>

        {/* Edit draft dialog (Req 4.3) */}
        <Dialog
          open={editState.open}
          onOpenChange={(open) => !open && setEditState((s) => ({ ...s, open: false }))}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Редактировать отклик</DialogTitle>
              <DialogDescription>Изменить черновик отклика перед отправкой</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Сумма (₸)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editState.amount}
                  onChange={(e) => setEditState((s) => ({ ...s, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-deadline">Срок выполнения</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={editState.deadline}
                  onChange={(e) => setEditState((s) => ({ ...s, deadline: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cover-letter">Сопроводительное письмо</Label>
                <Textarea
                  id="edit-cover-letter"
                  rows={5}
                  value={editState.coverLetter}
                  onChange={(e) => setEditState((s) => ({ ...s, coverLetter: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditState((s) => ({ ...s, open: false }))}
                disabled={isSavingEdit}
              >
                Отмена
              </Button>
              <Button onClick={saveEdit} disabled={isSavingEdit}>
                {isSavingEdit ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
