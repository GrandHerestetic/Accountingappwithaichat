"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Award, FileText, Loader2, Plus, Save, Trash2, X } from "lucide-react"
import { FileUploadField } from "@/components/file-upload-field"
import { FormField, fieldAriaProps, fieldInputClass } from "@/components/form-field"
import { attachProfileDocument, deleteAttachment } from "@/lib/api"
import type { ProfilePlatformAchievement } from "@/lib/api/types"
import {
  PROFILE_DOC_KIND_ACHIEVEMENT,
  type ProfileDocItem,
  isImageMime,
} from "@/lib/profile-documents"
import {
  clearFieldError,
  type FieldErrors,
  validateMinLength,
  validateRequired,
} from "@/lib/form-errors"
import { toast } from "sonner"

const MAX_BYTES = 10 * 1024 * 1024

type FormFieldKey = "title" | "description"

type Props = {
  userId: string
  items: ProfileDocItem[]
  platformAchievements?: ProfilePlatformAchievement[]
  onChanged: () => Promise<void>
}

export function ProfileAchievementsTab({
  userId,
  items,
  platformAchievements = [],
  onChanged,
}: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<FieldErrors<FormFieldKey>>({})

  const resetForm = () => {
    setFile(null)
    setTitle("")
    setDescription("")
    setErrors({})
    setOpen(false)
  }

  const handleSave = async () => {
    const nextErrors: FieldErrors<FormFieldKey> = {
      title: validateRequired(title.trim(), "Укажите название"),
      description: validateMinLength(description.trim(), 10, "Описание — минимум 10 символов"),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    if (!file) {
      toast.error("Прикрепите документ или изображение")
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error("Файл не больше 10 МБ")
      return
    }

    setSaving(true)
    try {
      await attachProfileDocument(userId, file, {
        kind: PROFILE_DOC_KIND_ACHIEVEMENT,
        title: title.trim(),
        description: description.trim(),
      })
      await onChanged()
      toast.success("Достижение сохранено")
      resetForm()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteAttachment(id)
      await onChanged()
      toast.success("Достижение удалено")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось удалить")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {platformAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Бейджи платформы</CardTitle>
            <CardDescription>Автоматически за активность на BuhPro</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {platformAchievements.map((a) => (
              <div key={a.code} className="flex gap-3 p-3 rounded-lg border bg-blue-50/50">
                <div className="p-2 bg-blue-100 rounded-full shrink-0 h-fit">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{a.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Мои достижения</CardTitle>
            <CardDescription>
              Сертификаты, дипломы и награды — с документом или фото и описанием
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новое достижение</DialogTitle>
                <DialogDescription>
                  Название, описание и файл (изображение или PDF)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FormField label="Название" htmlFor="ach-title" error={errors.title} required>
                  <Input
                    id="ach-title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      setErrors((prev) => clearFieldError(prev, "title"))
                    }}
                    placeholder="Сертификат 1С:Бухгалтерия"
                    className={fieldInputClass(errors.title)}
                    disabled={saving}
                    {...fieldAriaProps(errors.title, "ach-title")}
                  />
                </FormField>
                <FormField label="Описание" htmlFor="ach-desc" error={errors.description} required>
                  <Textarea
                    id="ach-desc"
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      setErrors((prev) => clearFieldError(prev, "description"))
                    }}
                    placeholder="Что подтверждает документ, год, организация..."
                    className={fieldInputClass(errors.description)}
                    disabled={saving}
                    {...fieldAriaProps(errors.description, "ach-desc")}
                  />
                </FormField>
                <FileUploadField
                  label="Документ или изображение"
                  hint="PDF, JPG, PNG, WEBP до 10 МБ"
                  accept="image/jpeg,image/png,image/webp,.pdf"
                  value={file}
                  onChange={setFile}
                  disabled={saving}
                  required
                />
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => void handleSave()} disabled={saving} className="flex-1">
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Сохранить
                  </Button>
                  <Button variant="outline" onClick={resetForm} disabled={saving}>
                    <X className="w-4 h-4 mr-2" />
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Достижений пока нет</h3>
              <p className="text-gray-600 mb-6">Добавьте сертификат или награду с подтверждающим файлом</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить достижение
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border overflow-hidden bg-white">
                  <div className="relative">
                    {isImageMime(item.mime_type) ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={item.url}
                          alt={item.title || item.original_name}
                          className="w-full h-40 object-cover"
                        />
                      </a>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-40 items-center justify-center gap-2 bg-gray-50 text-blue-600 px-4"
                      >
                        <FileText className="w-8 h-8 shrink-0" />
                        <span className="text-sm font-medium truncate">{item.original_name}</span>
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      disabled={deletingId === item.id}
                      onClick={() => void handleDelete(item.id)}
                      aria-label="Удалить"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium">{item.title || item.original_name}</h4>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Достижение
                      </Badge>
                    </div>
                    {item.description ? (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    ) : null}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
