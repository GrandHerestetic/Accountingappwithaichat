"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
import { Star, Loader2, Pencil, Trash2, Save, X } from "lucide-react"
import { deleteMyReview, listMyReviews, updateMyReview } from "@/lib/api"
import type { MyReview } from "@/lib/api/types"
import { toast } from "sonner"

const RATING_LABELS: Record<number, string> = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Удовлетворительно",
  4: "Хорошо",
  5: "Отлично",
}

function reviewTitle(item: MyReview): string {
  if (item.source === "order" && item.order_id) {
    return `Заказ #${item.order_id.slice(0, 8)}`
  }
  if (item.target_type && item.target_id) {
    return `${item.target_type} #${item.target_id.slice(0, 8)}`
  }
  return "Отзыв"
}

function reviewSubtitle(item: MyReview): string {
  if (item.direction === "client_to_executor") return "Вы оценили исполнителя"
  if (item.direction === "executor_to_client") return "Вы оценили заказчика"
  if (item.source === "entity") return "Отзыв на платформе"
  return ""
}

function reviewLink(item: MyReview, role?: string): string | null {
  if (item.source !== "order" || !item.order_id) return null
  if (role === "client") return `/client/order/${item.order_id}`
  if (role === "executor") return `/executor/orders/${item.order_id}/response`
  return `/orders/${item.order_id}`
}

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className="focus:outline-none disabled:cursor-not-allowed"
          aria-label={`Оценка ${n}`}
        >
          <Star
            className={`w-7 h-7 ${
              n <= value ? "text-yellow-500 fill-current" : "text-gray-300 hover:text-yellow-400"
            }`}
          />
        </button>
      ))}
      {value > 0 ? (
        <span className="text-sm text-gray-600 ml-2">{RATING_LABELS[value]}</span>
      ) : null}
    </div>
  )
}

type Props = {
  title?: string
  description?: string
  userRole?: string
}

export function MyReviewsPanel({
  title = "Мои отзывы",
  description = "Отзывы, которые вы оставили. Их можно изменить или удалить.",
  userRole,
}: Props) {
  const [items, setItems] = useState<MyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<MyReview | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listMyReviews({ page: 1, pageSize: 50 })
      setItems(data.items)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось загрузить отзывы")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openEdit = (item: MyReview) => {
    setEditing(item)
    setEditRating(item.rating)
    setEditComment(item.comment ?? "")
  }

  const closeEdit = () => {
    setEditing(null)
    setEditRating(0)
    setEditComment("")
  }

  const handleSave = async () => {
    if (!editing) return
    if (editRating < 1) {
      toast.error("Выберите оценку")
      return
    }
    setSaving(true)
    try {
      await updateMyReview(editing.id, {
        rating: editRating,
        comment: editComment.trim() || undefined,
      })
      toast.success("Отзыв обновлён")
      closeEdit()
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteMyReview(id)
      toast.success("Отзыв удалён")
      if (editing?.id === id) closeEdit()
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось удалить")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Вы ещё не оставляли отзывов. Отзыв можно оставить после завершения заказа.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const href = reviewLink(item, userRole)
                return (
                  <div
                    key={`${item.source}-${item.id}`}
                    className="border rounded-lg p-4 bg-white space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        {href ? (
                          <Link href={href} className="font-medium text-blue-600 hover:underline">
                            {reviewTitle(item)}
                          </Link>
                        ) : (
                          <p className="font-medium">{reviewTitle(item)}</p>
                        )}
                        {reviewSubtitle(item) ? (
                          <p className="text-xs text-gray-500 mt-0.5">{reviewSubtitle(item)}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i <= item.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {item.comment ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.comment}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Без комментария</p>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t">
                      <p className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleString("ru-RU")}
                        {item.updated_at !== item.created_at
                          ? ` · изменён ${new Date(item.updated_at).toLocaleString("ru-RU")}`
                          : ""}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                          <Pencil className="w-3 h-3 mr-1" />
                          Изменить
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              disabled={deletingId === item.id}
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 mr-1" />
                              )}
                              Удалить
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Отзыв будет удалён без возможности восстановления. Рейтинг
                                получателя пересчитается.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => void handleDelete(item.id)}
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать отзыв</DialogTitle>
            <DialogDescription>
              {editing ? reviewTitle(editing) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Оценка</p>
              <StarRating value={editRating} onChange={setEditRating} disabled={saving} />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Комментарий</p>
              <Textarea
                rows={4}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                disabled={saving}
                placeholder="Ваш комментарий..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void handleSave()} disabled={saving} className="flex-1">
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Сохранить
              </Button>
              <Button variant="outline" onClick={closeEdit} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
