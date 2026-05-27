"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { getOrder, listMyOrderResponses, saveOrderResponseDraft, submitMyResponse, uploadAndAttach } from "@/lib/api"
import type { Order, OrderResponse } from "@/lib/api/types"
import { ApiError } from "@/lib/api/types"

const DEADLINE_MARKER = "\n\nПредлагаемый срок: "

function parseCoverLetter(coverLetter: string): { message: string; deadline: string } {
  const idx = coverLetter.lastIndexOf(DEADLINE_MARKER)
  if (idx === -1) {
    return { message: coverLetter, deadline: "" }
  }
  return {
    message: coverLetter.slice(0, idx),
    deadline: coverLetter.slice(idx + DEADLINE_MARKER.length).trim(),
  }
}

export default function ResponseToOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [responseData, setResponseData] = useState({
    price: "",
    deadline: "",
    message: "",
    attachments: [] as File[],
  })
  const [order, setOrder] = useState<Order | null>(null)
  const [existingResponse, setExistingResponse] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // ── Req 4.1: fetch order details ──────────────────────────────────────────
  useEffect(() => {
    const fetchOrder = async () => {
      let redirectToResponses = false
      try {
        const [data, myResponses] = await Promise.all([
          getOrder(params.id),
          listMyOrderResponses(params.id).catch(() => ({ items: [] as OrderResponse[] })),
        ])
        setOrder(data)

        const editable = myResponses.items.find(
          (item) => item.status === "draft" || item.status === "payment_pending"
        )
        const submitted = myResponses.items.find(
          (item) =>
            item.status === "submitted" || item.status === "accepted" || item.status === "rejected"
        )

        if (submitted && !editable) {
          redirectToResponses = true
          router.replace("/executor/responses")
          return
        }

        if (editable) {
          setExistingResponse(editable)
          const { message, deadline } = parseCoverLetter(editable.cover_letter)
          setResponseData({
            price: String(editable.proposed_amount),
            deadline: editable.proposed_deadline?.split("T")[0] ?? deadline,
            message,
            attachments: [],
          })
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Не удалось загрузить заказ"
        toast.error(message)
      } finally {
        if (!redirectToResponses) {
          setLoading(false)
        }
      }
    }
    fetchOrder()
  }, [params.id, router])

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Заказ не найден</h2>
            <p className="text-gray-600 mb-4">Заказ не существует или был удален</p>
            <Link href="/executor/orders">
              <Button>Вернуться к заказам</Button>
            </Link>
          </CardContent>
        </Card>
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

  // ── Req 4.1: submit response (POST /api/v1/orders/:id/responses) ──────────
  // ── Req 4.4: then submit for payment (POST .../submit) ────────────────────
  const handleSubmitResponse = async () => {
    if (!responseData.price || !responseData.deadline || !responseData.message) {
      toast.error("Пожалуйста, заполните все обязательные поля")
      return
    }

    const trimmedMessage = responseData.message.trim()
    if (trimmedMessage.length < 100) {
      toast.error("Сопроводительное письмо должно быть не короче 100 символов")
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
        params.id,
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
        await uploadAndAttach(
          responseData.attachments,
          "response_attachment",
          savedResponse.id
        )
      }

      const submitResult = await submitMyResponse(params.id, savedResponse.id)

      if (submitResult.checkout_url) {
        window.open(submitResult.checkout_url, "_blank")
      }

      toast.success("Отклик успешно отправлен!")
      router.push("/executor/responses")
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("У вас уже есть отклик на этот заказ. Откройте «Мои отклики» для редактирования.")
      } else {
        const message = err instanceof Error ? err.message : "Не удалось отправить отклик"
        toast.error(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">BuhPro</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/executor/dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Дашборд
          </Link>
          <Link href="/executor/orders" className="text-sm font-medium text-green-600">
            Заказы
          </Link>
          <Link href="/executor/responses" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Мои отклики
          </Link>
        </nav>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link href="/executor/orders">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к заказам
            </Button>
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Order Details + Response Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
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
                          {order.budget_amount.toLocaleString()} ₸
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
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Описание заказа</h3>
                      <p className="text-gray-700 leading-relaxed">{order.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Ваше предложение</CardTitle>
                  <CardDescription>Заполните форму отклика. Будьте конкретны и профессиональны.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {existingResponse?.status === "draft" || existingResponse?.status === "payment_pending" ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      У вас уже есть черновик отклика на этот заказ. Изменения будут сохранены в существующий
                      отклик.
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
                      <p className="text-xs text-gray-500">Укажите стоимость в тенге</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Срок выполнения (дата) *</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={responseData.deadline}
                        onChange={(e) => setResponseData((prev) => ({ ...prev, deadline: e.target.value }))}
                      />
                      <p className="text-xs text-gray-500">Укажите реальный срок (ISO 8601)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Сопроводительное письмо *</Label>
                    <Textarea
                      id="message"
                      placeholder="Расскажите о своем опыте, подходе к работе и почему именно вас стоит выбрать..."
                      rows={6}
                      value={responseData.message}
                      onChange={(e) => setResponseData((prev) => ({ ...prev, message: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500">Минимум 100 символов</p>
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
                        <p className="text-sm text-gray-600">Нажмите для выбора файлов или перетащите их сюда</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (макс. 10 МБ)</p>
                      </label>
                    </div>

                    {responseData.attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Прикрепленные файлы:</p>
                        {responseData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button size="sm" variant="ghost" onClick={() => removeFile(index)}>
                              Удалить
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Советы для успешного отклика:</p>
                        <ul className="text-blue-800 mt-1 space-y-1">
                          <li>• Внимательно изучите требования заказчика</li>
                          <li>• Укажите реальные сроки выполнения</li>
                          <li>• Приложите примеры своих работ</li>
                          <li>• Будьте конкретны в описании подхода к работе</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitResponse}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Отправка..."
                      : existingResponse?.status === "draft" || existingResponse?.status === "payment_pending"
                        ? "Сохранить и отправить отклик"
                        : "Отправить отклик"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
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
                      {order.budget_amount.toLocaleString()} ₸
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Категория:</span>
                    <span className="font-medium">{order.category_slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Статус:</span>
                    <span className="font-medium">{order.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Создан:</span>
                    <span className="font-medium">
                      {new Date(order.created_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {(responseData.price || responseData.deadline) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ваше предложение</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {responseData.price && (
                      <div className="flex justify-between">
                        <span>Цена:</span>
                        <span className="font-medium">{responseData.price} ₸</span>
                      </div>
                    )}
                    {responseData.deadline && (
                      <div className="flex justify-between">
                        <span>Срок:</span>
                        <span className="font-medium">
                          {new Date(responseData.deadline).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
