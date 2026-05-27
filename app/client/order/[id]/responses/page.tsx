"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MessageCircle, CheckCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { listClientOrderResponses, selectClientResponse } from "@/lib/api"
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
  payment_pending: "Черновик",
  submitted: "Отправлен",
  accepted: "Принят",
  rejected: "Отклонён",
  cancelled: "Отменён",
}

export default function OrderResponses({ params }: { params: { id: string } }) {
  const orderId = params.id

  const [responses, setResponses] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectingId, setSelectingId] = useState<string | null>(null)

  // ── Req 4.5: fetch paid responses only ────────────────────────────────────
  const fetchResponses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await listClientOrderResponses(orderId)
      // Req 4.5 / 4.7: display only responses where is_paid === true
      setResponses(data.items.filter((r) => r.is_paid === true))
    } catch (err: unknown) {
      // Req 4.9: error toast on API failure
      const message = err instanceof Error ? err.message : "Не удалось загрузить отклики"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  // ── Req 4.6: select executor after confirmation dialog ────────────────────
  const handleSelectExecutor = async (responseId: string) => {
    setSelectingId(responseId)
    try {
      await selectClientResponse(orderId, responseId)
      toast.success("Исполнитель выбран!")
      await fetchResponses()
    } catch (err: unknown) {
      // Req 4.9: error toast on API failure
      const message = err instanceof Error ? err.message : "Не удалось выбрать исполнителя"
      toast.error(message)
    } finally {
      setSelectingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Загрузка откликов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Отклики исполнителей</CardTitle>
              {/* Req 4.5: only paid responses are shown */}
              <Badge className="bg-blue-100 text-blue-800">{responses.length} оплаченных откликов</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Responses list */}
        <div className="space-y-6">
          {responses.map((response) => (
            <Card key={response.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  {/* Response details */}
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
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Предложенная сумма:</span>
                        <p className="font-semibold text-green-600 text-lg">
                          {response.proposed_amount.toLocaleString()} ₸
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Срок выполнения:</span>
                        <p className="font-medium">
                          {response.proposed_deadline
                            ? new Date(response.proposed_deadline).toLocaleDateString("ru-RU")
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Сопроводительное письмо:</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{response.cover_letter}</p>
                    </div>

                    <p className="text-xs text-gray-400">ID исполнителя: {response.executor_id}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {/* Req 4.6: confirmation dialog before selecting executor */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className="bg-green-600 hover:bg-green-700 w-full"
                          disabled={selectingId === response.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {selectingId === response.id ? "Выбор..." : "Выбрать исполнителя"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Выбрать исполнителя?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы собираетесь выбрать этого исполнителя для вашего заказа. Предложенная сумма:{" "}
                            <strong>{response.proposed_amount.toLocaleString()} ₸</strong>. Это действие
                            нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleSelectExecutor(response.id)}
                          >
                            Да, выбрать
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {response.status === "accepted" ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/chat/${orderId}`}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Написать
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled title="Чат доступен после выбора исполнителя">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Написать
                      </Button>
                    )}
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
              <div className="text-gray-400 mb-4">
                <MessageCircle className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">Пока нет оплаченных откликов</h3>
              <p className="text-gray-600">
                Исполнители скоро начнут откликаться на ваш заказ. Оплаченные отклики появятся здесь.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
