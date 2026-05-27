"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
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
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Award,
  ThumbsUp,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import {
  completeClientOrder,
  createClientOrderReview,
  deleteMyReview,
  getClientOrderReview,
  reopenClientOrder,
  updateMyReview,
} from "@/lib/api"
import type { Review, ApiError } from "@/lib/api/types"
import { toast } from "sonner"

export default function CompleteOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const orderId = params.id

  // Complete-order state
  const [isCompleting, setIsCompleting] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [reopening, setReopening] = useState(false)

  // Review state
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [isLoadingReview, setIsLoadingReview] = useState(true)

  // Load existing review on mount
  useEffect(() => {
    const fetchReview = async () => {
      setIsLoadingReview(true)
      try {
        const review = await getClientOrderReview(orderId)
        if (review) {
          setExistingReview(review)
          setRating(review.rating)
          setComment(review.comment ?? "")
        } else {
          setExistingReview(null)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Не удалось загрузить отзыв")
      } finally {
        setIsLoadingReview(false)
      }
    }

    fetchReview()
  }, [orderId])

  // Complete order handler (called after AlertDialog confirmation)
  const handleCompleteOrder = async () => {
    setIsCompleting(true)
    try {
      await completeClientOrder(orderId)
      toast.success("Заказ успешно завершён! Теперь вы можете оставить отзыв.")
      setOrderCompleted(true)
    } catch (err) {
      const apiErr = err as ApiError
      toast.error(apiErr.message ?? "Не удалось завершить заказ")
    } finally {
      setIsCompleting(false)
    }
  }

  // Review submit handler
  const handleReopenOrder = async () => {
    if (!confirm("Вернуть заказ в работу?")) return
    setReopening(true)
    try {
      await reopenClientOrder(orderId)
      toast.success("Заказ снова в работе")
      setOrderCompleted(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось переоткрыть заказ")
    } finally {
      setReopening(false)
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Пожалуйста, поставьте оценку исполнителю")
      return
    }
    if (!comment.trim()) {
      toast.error("Пожалуйста, напишите комментарий к отзыву")
      return
    }

    setIsSubmittingReview(true)
    try {
      if (existingReview?.id) {
        await updateMyReview(existingReview.id, { rating, comment: comment.trim() })
        toast.success("Отзыв обновлён")
      } else {
        await createClientOrderReview(orderId, { rating, comment: comment.trim() })
        toast.success("Отзыв успешно отправлен!")
      }
      router.push(`/client/order/${orderId}`)
    } catch (err) {
      const apiErr = err as ApiError
      toast.error(apiErr.message ?? "Не удалось сохранить отзыв")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!existingReview?.id) return
    if (!confirm("Удалить отзыв? Это действие нельзя отменить.")) return
    setIsSubmittingReview(true)
    try {
      await deleteMyReview(existingReview.id)
      setExistingReview(null)
      setRating(0)
      setComment("")
      toast.success("Отзыв удалён")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить отзыв")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const ratingLabels: Record<number, string> = {
    1: "Очень плохо",
    2: "Плохо",
    3: "Удовлетворительно",
    4: "Хорошо",
    5: "Отлично",
  }

  const isEditing = existingReview !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back Button */}
          <Link href={`/client/order/${orderId}`}>
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к заказу
            </Button>
          </Link>

          <div className="space-y-8">
            {/* Complete Order Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Завершение заказа</CardTitle>
                <CardDescription>
                  Подтвердите завершение заказа, чтобы средства были переведены исполнителю
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orderCompleted ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">Заказ успешно завершён. Оставьте отзыв ниже.</span>
                    </div>
                    <Button variant="outline" onClick={handleReopenOrder} disabled={reopening}>
                      {reopening ? "Открытие..." : "Вернуть заказ в работу"}
                    </Button>
                  </div>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        size="lg"
                        disabled={isCompleting}
                      >
                        {isCompleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Завершение...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Завершить заказ
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Подтверждение завершения заказа</AlertDialogTitle>
                        <AlertDialogDescription>
                          Вы уверены, что хотите завершить заказ? После подтверждения средства будут переведены
                          исполнителю в течение 24 часов. Это действие нельзя отменить.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCompleteOrder}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Подтвердить завершение
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>

            {/* Review Section */}
            <Card>
              <CardHeader>
                <CardTitle>Отзыв об исполнителе</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Отзыв можно изменить или удалить"
                    : "Ваша оценка поможет другим заказчикам и повлияет на рейтинг исполнителя"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingReview ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Загрузка...</span>
                  </div>
                ) : (
                  <>
                    {isEditing && existingReview && (
                      <div className="flex items-center gap-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">
                          Отзыв от{" "}
                          {new Intl.DateTimeFormat("ru-RU", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(existingReview.created_at))}
                        </span>
                      </div>
                    )}

                    {/* Rating Stars */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Оценка качества работы <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className="focus:outline-none disabled:cursor-not-allowed"
                            aria-label={`Оценка ${value}`}
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                value <= rating
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300 hover:text-yellow-400"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <Badge variant="secondary">{ratingLabels[rating]}</Badge>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Комментарий <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Расскажите о качестве выполненной работы, соблюдении сроков, профессионализме исполнителя..."
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Обязательное поле. Ваш отзыв будет виден другим пользователям.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleSubmitReview}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        size="lg"
                        disabled={isSubmittingReview || rating === 0 || !comment.trim()}
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4 mr-2" />
                            {isEditing ? "Сохранить изменения" : "Отправить отзыв"}
                          </>
                        )}
                      </Button>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="text-red-600 hover:text-red-700"
                          disabled={isSubmittingReview}
                          onClick={() => void handleDeleteReview()}
                        >
                          Удалить отзыв
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Info block */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-2">Важная информация о рейтинге</h4>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p>• Ваша оценка влияет на рейтинг исполнителя и его возможности получать новые заказы</p>
                      <p>
                        • Если рейтинг исполнителя опустится ниже 3.0, он будет автоматически заблокирован на 7 дней
                      </p>
                      <p>• При повторном нарушении исполнитель направляется на обучающие курсы</p>
                      <p>• Будьте объективны в своей оценке</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
