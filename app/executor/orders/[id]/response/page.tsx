"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Paperclip,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { getOrder, listMyOrderResponses, saveOrderResponseDraft, submitMyResponse, uploadAndAttach } from "@/lib/api"
import type { Order, OrderResponse } from "@/lib/api/types"
import { responseActionErrorMessage } from "@/lib/response-errors"

const DEADLINE_MARKER = "\n\nПредлагаемый срок: "
/** Мягкий минимум для качества отклика (бэкенд не требует). */
const MIN_COVER_LETTER_LENGTH = 30

function parseCoverLetter(coverLetter?: string | null): { message: string; deadline: string } {
  const text = (coverLetter ?? "").trim()
  if (!text) {
    return { message: "", deadline: "" }
  }
  const idx = text.lastIndexOf(DEADLINE_MARKER)
  if (idx === -1) {
    return { message: text, deadline: "" }
  }
  return {
    message: text.slice(0, idx),
    deadline: text.slice(idx + DEADLINE_MARKER.length).trim(),
  }
}

function ResponseToOrderContent() {
  const params = useParams()
  const orderId = typeof params.id === "string" ? params.id : ""
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [responseData, setResponseData] = useState({
    price: "",
    deadline: "",
    message: "",
    attachments: [] as File[],
  })
  const [order, setOrder] = useState<Order | null>(null)
  const [existingResponse, setExistingResponse] = useState<OrderResponse | null>(null)
  const [submittedResponse, setSubmittedResponse] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        const [data, myResponses] = await Promise.all([
          getOrder(orderId),
          isAuthenticated
            ? listMyOrderResponses(orderId).catch(() => ({ items: [] as OrderResponse[] }))
            : Promise.resolve({ items: [] as OrderResponse[] }),
        ])
        setOrder(data)

        const items = myResponses.items ?? []
        const editable = items.find(
          (item) => item.status === "draft" || item.status === "payment_pending"
        )
        const submitted = items.find((item) =>
          ["submitted", "accepted", "rejected"].includes(item.status)
        )

        if (submitted && !editable) {
          setSubmittedResponse(submitted)
          setExistingResponse(null)
          return
        }

        if (editable) {
          setExistingResponse(editable)
          setSubmittedResponse(null)
          const { message, deadline } = parseCoverLetter(editable.cover_letter)
          setResponseData({
            price: String(editable.proposed_amount ?? ""),
            deadline: editable.proposed_deadline?.split("T")[0] ?? deadline,
            message,
            attachments: [],
          })
        } else {
          setExistingResponse(null)
          setSubmittedResponse(null)
        }
      } catch (err: unknown) {
        setOrder(null)
        toast.error(err instanceof Error ? err.message : "Не удалось загрузить заказ")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, isAuthenticated])

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Некорректная ссылка на заказ</p>
      </div>
    )
  }

  if (user?.role === "client") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <Navigation />
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Нужен аккаунт исполнителя</h1>
          <p className="text-gray-600 mb-6">
            Вы вошли как заказчик. Чтобы откликнуться на заказ, войдите под аккаунтом исполнителя.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/auth/login">
              <Button>Сменить аккаунт</Button>
            </Link>
            <Link href="/executor/orders">
              <Button variant="outline">К заказам</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <Navigation />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Заказ не найден</h2>
              <p className="text-gray-600 mb-4">Заказ не существует или недоступен для отклика</p>
              <Link href="/executor/orders">
                <Button>Вернуться к заказам</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (order.status !== "published") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <Navigation />
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Отклики недоступны</h1>
          <p className="text-gray-600 mb-6">
            На этот заказ можно откликаться только после публикации. Текущий статус:{" "}
            <strong>{order.status}</strong>.
          </p>
          <Link href="/executor/orders">
            <Button variant="outline">К списку заказов</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setResponseData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }))
  }

  const removeFile = (index: number) => {
    setResponseData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const handleSubmitResponse = async () => {
    if (!isAuthenticated) {
      toast.error("Войдите как исполнитель, чтобы отправить отклик")
      router.push("/auth/login")
      return
    }

    if (!responseData.price || !responseData.deadline || !responseData.message) {
      toast.error("Пожалуйста, заполните все обязательные поля")
      return
    }

    const trimmedMessage = responseData.message.trim()
    if (trimmedMessage.length < MIN_COVER_LETTER_LENGTH) {
      toast.error(
        `Сопроводительное письмо должно быть не короче ${MIN_COVER_LETTER_LENGTH} символов (сейчас ${trimmedMessage.length})`
      )
      return
    }

    const proposedAmount = parseFloat(responseData.price)
    if (isNaN(proposedAmount) || proposedAmount <= 0) {
      toast.error("Укажите корректную сумму")
      return
    }

    setSubmitting(true)
    try {
      const savedResponse = await saveOrderResponseDraft(
        orderId,
        {
          proposed_amount: proposedAmount,
          proposed_deadline: responseData.deadline,
          cover_letter: trimmedMessage,
        },
        existingResponse?.status === "draft" || existingResponse?.status === "payment_pending"
          ? existingResponse.id
          : undefined
      )

      if (responseData.attachments.length > 0) {
        await uploadAndAttach(responseData.attachments, "response_attachment", savedResponse.id)
      }

      await submitMyResponse(orderId, savedResponse.id)

      toast.success("Отклик успешно отправлен!")
      router.replace("/executor/responses")
    } catch (err: unknown) {
      toast.error(responseActionErrorMessage(err, "Не удалось отправить отклик"))
    } finally {
      setSubmitting(false)
    }
  }

  const messageLength = responseData.message.trim().length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/executor/orders">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к заказам
            </Button>
          </Link>

          {submittedResponse ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-14 h-14 text-green-600 mx-auto" />
                <h2 className="text-xl font-bold mt-4 mb-2">Отклик уже отправлен</h2>
                <p className="text-gray-600 mb-6">
                  Вы уже откликались на этот заказ. Статус:{" "}
                  <Badge className="ml-1">{submittedResponse.status}</Badge>
                </p>
                <Link href="/executor/responses">
                  <Button className="bg-green-600 hover:bg-green-700">Мои отклики</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h1 className="text-xl font-bold">{order.title}</h1>
                          <Badge variant="outline">{order.category_slug}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {Number(order.budget_amount ?? 0).toLocaleString("ru-RU")} ₸
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Создан: {new Date(order.created_at).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium mb-2">Описание заказа</h3>
                    <p className="text-gray-700 leading-relaxed">{order.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ваше предложение</CardTitle>
                    <CardDescription>Заполните форму отклика. Будьте конкретны и профессиональны.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {existingResponse?.status === "draft" ||
                    existingResponse?.status === "payment_pending" ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        У вас есть черновик отклика — изменения будут сохранены в него.
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="price">Ваша цена (₸) *</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="45000"
                          value={responseData.price}
                          onChange={(e) => setResponseData((prev) => ({ ...prev, price: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deadline">Срок выполнения (дата) *</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={responseData.deadline}
                          onChange={(e) =>
                            setResponseData((prev) => ({ ...prev, deadline: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Сопроводительное письмо *</Label>
                      <Textarea
                        id="message"
                        placeholder="Расскажите о своём опыте, подходе к работе и почему именно вас стоит выбрать..."
                        rows={6}
                        value={responseData.message}
                        onChange={(e) =>
                          setResponseData((prev) => ({ ...prev, message: e.target.value }))
                        }
                      />
                      <p
                        className={`text-xs ${
                          messageLength >= MIN_COVER_LETTER_LENGTH ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {messageLength} символов
                        {messageLength < MIN_COVER_LETTER_LENGTH
                          ? ` — рекомендуем не менее ${MIN_COVER_LETTER_LENGTH}`
                          : ""}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="attachments">Прикрепить файлы</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="attachments"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label htmlFor="attachments" className="cursor-pointer">
                          <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">PDF, DOC, DOCX, JPG, PNG</p>
                        </label>
                      </div>
                      {responseData.attachments.length > 0 && (
                        <div className="space-y-2">
                          {responseData.attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm">{file.name}</span>
                              <Button size="sm" variant="ghost" onClick={() => removeFile(index)}>
                                Удалить
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmitResponse}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? "Отправка..." : "Отправить отклик"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Детали заказа
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Бюджет:</span>
                      <span className="font-medium text-green-600">
                        {Number(order.budget_amount ?? 0).toLocaleString("ru-RU")} ₸
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Статус:</span>
                      <span className="font-medium">{order.status}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ResponseToOrderPage() {
  return (
    <ProtectedRoute allowedRoles={["executor"]}>
      <ResponseToOrderContent />
    </ProtectedRoute>
  )
}
