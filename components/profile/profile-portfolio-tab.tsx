"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ImageIcon, Loader2, Plus, Save, Trash2, X } from "lucide-react"
import { FileUploadField } from "@/components/file-upload-field"
import { FormField } from "@/components/form-field"
import { attachProfileDocument, deleteAttachment } from "@/lib/api"
import {
  PROFILE_DOC_KIND_PORTFOLIO,
  type ProfileDocItem,
  isImageMime,
} from "@/lib/profile-documents"
import { toast } from "sonner"

const MAX_BYTES = 10 * 1024 * 1024

type Props = {
  userId: string
  items: ProfileDocItem[]
  onChanged: () => Promise<void>
}

export function ProfilePortfolioTab({ userId, items, onChanged }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")

  const resetForm = () => {
    setFile(null)
    setCaption("")
    setOpen(false)
  }

  const handleSave = async () => {
    if (!file) {
      toast.error("Выберите изображение")
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("В портфолио можно добавить только изображение")
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error("Файл не больше 10 МБ")
      return
    }

    setSaving(true)
    try {
      await attachProfileDocument(userId, file, {
        kind: PROFILE_DOC_KIND_PORTFOLIO,
        caption: caption.trim(),
      })
      await onChanged()
      toast.success("Добавлено в портфолио")
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
      toast.success("Удалено из портфолио")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось удалить")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Портфолио</CardTitle>
          <CardDescription>Изображения работ с подписью — видны в вашем профиле</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить работу
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая работа</DialogTitle>
              <DialogDescription>Загрузите изображение и добавьте подпись</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <FileUploadField
                label="Изображение"
                hint="JPG, PNG, WEBP до 10 МБ"
                accept="image/jpeg,image/png,image/webp"
                value={file}
                onChange={setFile}
                disabled={saving}
                required
              />
              <FormField label="Подпись" htmlFor="portfolio-caption">
                <Input
                  id="portfolio-caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Например: Годовая отчётность для ТОО"
                  disabled={saving}
                />
              </FormField>
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
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Портфолио пусто</h3>
            <p className="text-gray-600 mb-6">Добавьте примеры работ с подписями</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить работу
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg border bg-white overflow-hidden shadow-sm"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
                {isImageMime(item.mime_type) ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={item.url}
                      alt={item.caption || item.original_name}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </a>
                ) : (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-[4/3] items-center justify-center bg-gray-100 text-sm text-blue-600 px-4 text-center"
                  >
                    {item.original_name}
                  </a>
                )}
                <div className="p-3">
                  {item.caption ? (
                    <p className="text-sm font-medium text-gray-900">{item.caption}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Без подписи</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
