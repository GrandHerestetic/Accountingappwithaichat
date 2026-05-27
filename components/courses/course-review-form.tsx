"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, Award, Loader2, CheckCircle } from "lucide-react"
import {
  createEntityReview,
  deleteMyReview,
  getMyCourseReview,
  updateMyReview,
} from "@/lib/api"
import type { MyReview } from "@/lib/api/types"
import { toast } from "sonner"

const RATING_LABELS: Record<number, string> = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Удовлетворительно",
  4: "Хорошо",
  5: "Отлично",
}

interface CourseReviewFormProps {
  courseId: string
  assignmentId?: string
  onSubmitted?: () => void
}

export function CourseReviewForm({ courseId, assignmentId, onSubmitted }: CourseReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [existingReview, setExistingReview] = useState<MyReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const review = await getMyCourseReview(courseId)
        if (cancelled) return
        setExistingReview(review)
        if (review) {
          setRating(review.rating)
          setComment(review.comment ?? "")
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Не удалось загрузить отзыв")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [courseId])

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Поставьте оценку курсу")
      return
    }

    setSubmitting(true)
    try {
      if (existingReview?.id) {
        const updated = await updateMyReview(existingReview.id, {
          rating,
          comment: comment.trim() || undefined,
        })
        setExistingReview(updated)
        toast.success("Отзыв обновлён")
      } else {
        const created = await createEntityReview({
          target_type: "course",
          target_id: courseId,
          rating,
          comment: comment.trim() || undefined,
          metadata: assignmentId ? { course_assignment_id: assignmentId } : undefined,
        })
        setExistingReview({
          id: created.id,
          source: "entity",
          target_type: "course",
          target_id: courseId,
          rating: created.rating,
          comment: created.comment ?? null,
          metadata: created.metadata,
          created_at: created.created_at,
          updated_at: created.updated_at,
        })
        toast.success("Спасибо за отзыв!")
      }
      onSubmitted?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить отзыв")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingReview?.id) return
    if (!confirm("Удалить отзыв? Это действие нельзя отменить.")) return

    setSubmitting(true)
    try {
      await deleteMyReview(existingReview.id)
      setExistingReview(null)
      setRating(0)
      setComment("")
      toast.success("Отзыв удалён")
      onSubmitted?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить отзыв")
    } finally {
      setSubmitting(false)
    }
  }

  const isEditing = existingReview !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отзыв о курсе</CardTitle>
        <CardDescription>
          {isEditing
            ? "Вы уже оставили отзыв — его можно изменить или удалить"
            : "Поделитесь впечатлениями — это поможет другим исполнителям и улучшит курсы"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
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

            <div>
              <label className="block text-sm font-medium mb-3">
                Оценка курса <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="focus:outline-none"
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
              {rating > 0 && <Badge variant="secondary">{RATING_LABELS[rating]}</Badge>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Комментарий</label>
              <Textarea
                placeholder="Что понравилось, что можно улучшить, насколько материал был полезен..."
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => void handleSubmit()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
                disabled={submitting || rating === 0}
              >
                {submitting ? (
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
                  disabled={submitting}
                  onClick={() => void handleDelete()}
                >
                  Удалить отзыв
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
