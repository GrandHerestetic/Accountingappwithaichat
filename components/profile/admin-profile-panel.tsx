"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Briefcase,
  Users,
  AlertTriangle,
  BarChart3,
  Loader2,
  Save,
  Mail,
  Phone,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { getProfile, updateProfile, uploadProfileAvatar } from "@/lib/api"
import { FileUploadField } from "@/components/file-upload-field"
import { FormField, fieldAriaProps, fieldInputClass } from "@/components/form-field"
import {
  clearFieldError,
  type FieldErrors,
  validateMinLength,
  validatePhone,
} from "@/lib/form-errors"
import { resolveUploadUrl } from "@/lib/upload-url"
import { toast } from "sonner"

type AdminField = "name" | "phone"

const QUICK_LINKS = [
  { href: "/admin/dashboard", label: "Обзор", icon: Shield, description: "Сводка по платформе" },
  { href: "/admin/moderation", label: "Модерация", icon: Shield, description: "Санкции исполнителей" },
  { href: "/admin/orders", label: "Заказы", icon: Briefcase, description: "Все заказы" },
  { href: "/admin/users", label: "Пользователи", icon: Users, description: "Учётные записи" },
  { href: "/admin/disputes", label: "Санкции", icon: AlertTriangle, description: "Активные ограничения" },
  { href: "/admin/analytics", label: "Аналитика", icon: BarChart3, description: "Статистика" },
] as const

export function AdminProfilePanel() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("")
  const [errors, setErrors] = useState<FieldErrors<AdminField>>({})
  const [form, setForm] = useState({ name: "", phone: "", note: "" })

  useEffect(() => {
    if (!user) return
    getProfile()
      .then((p) => {
        setForm({
          name: String(p.profile_name ?? user.profile?.profile_name ?? user.email ?? ""),
          phone: String(p.phone ?? ""),
          note: String(p.about ?? p.bio ?? ""),
        })
      })
      .catch(() => {
        setForm({
          name: String(user.profile?.profile_name ?? user.email ?? ""),
          phone: String(user.profile?.phone ?? ""),
          note: "",
        })
      })
      .finally(() => setLoading(false))
  }, [user])

  const avatarUrl =
    avatarPreviewUrl ||
    resolveUploadUrl(user?.profile?.avatar_url) ||
    "/placeholder.svg?height=120&width=120"

  const displayName = form.name || user?.email || "Администратор"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleAvatarSave = async () => {
    if (!avatarFile) return
    setAvatarSaving(true)
    try {
      const updated = await uploadProfileAvatar(avatarFile)
      const url = resolveUploadUrl(String(updated.avatar_url ?? ""))
      if (url) setAvatarPreviewUrl(url)
      await refreshUser()
      setAvatarFile(null)
      toast.success("Фото обновлено")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setAvatarSaving(false)
    }
  }

  const handleSave = async () => {
    const nextErrors: FieldErrors<AdminField> = {
      name: validateMinLength(form.name, 2, "Укажите имя"),
      phone: validatePhone(form.phone),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSaving(true)
    try {
      const updated = await updateProfile(
        {
          profile_name: form.name.trim(),
          phone: form.phone.trim(),
          about: form.note.trim(),
          bio: form.note.trim(),
        },
        "admin"
      )
      setForm({
        name: String(updated.profile_name ?? form.name),
        phone: String(updated.phone ?? form.phone),
        note: String(updated.about ?? updated.bio ?? form.note),
      })
      await refreshUser()
      toast.success("Сохранено")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <Navigation />
        <main className="py-8 container mx-auto px-4 max-w-3xl">
          <div className="mb-6">
            <Badge className="mb-3 bg-orange-600 hover:bg-orange-600">Администратор</Badge>
            <h1 className="text-3xl font-bold text-gray-900">Профиль модератора</h1>
            <p className="text-gray-600 mt-1">
              Контактные данные и быстрый доступ к разделам админ-панели
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="border-orange-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Учётная запись</CardTitle>
                  <CardDescription>Только служебные поля — без портфолио и рейтингов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <Avatar className="h-24 w-24 shrink-0 border-2 border-orange-200">
                      <AvatarImage src={avatarUrl} alt="" />
                      <AvatarFallback className="text-xl bg-orange-100 text-orange-800">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 w-full space-y-3 min-w-0">
                      <p className="font-semibold text-lg">{displayName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{user?.email}</span>
                      </div>
                      {form.phone ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{form.phone}</span>
                        </div>
                      ) : null}
                      <FileUploadField
                        label="Сменить фото"
                        hint="JPG, PNG, WEBP"
                        accept="image/jpeg,image/png,image/webp"
                        value={avatarFile}
                        onChange={setAvatarFile}
                        disabled={avatarSaving}
                      />
                      {avatarFile ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={avatarSaving}
                          onClick={() => void handleAvatarSave()}
                        >
                          {avatarSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          Применить фото
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Отображаемое имя" htmlFor="admin-name" error={errors.name} required>
                      <Input
                        id="admin-name"
                        value={form.name}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, name: e.target.value }))
                          setErrors((prev) => clearFieldError(prev, "name"))
                        }}
                        className={fieldInputClass(errors.name)}
                        {...fieldAriaProps(errors.name, "admin-name")}
                      />
                    </FormField>
                    <FormField label="Телефон" htmlFor="admin-phone" error={errors.phone}>
                      <Input
                        id="admin-phone"
                        value={form.phone}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, phone: e.target.value }))
                          setErrors((prev) => clearFieldError(prev, "phone"))
                        }}
                        className={fieldInputClass(errors.phone)}
                        {...fieldAriaProps(errors.phone, "admin-phone")}
                      />
                    </FormField>
                  </div>

                  <FormField label="Заметка (необязательно)" htmlFor="admin-note">
                    <Textarea
                      id="admin-note"
                      rows={2}
                      value={form.note}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      placeholder="Служебный комментарий, виден только вам"
                    />
                  </FormField>

                  <Button
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Сохранить
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-orange-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Разделы модерации</CardTitle>
                  <CardDescription>Переход к задачам администратора</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {QUICK_LINKS.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-orange-100 bg-white hover:bg-orange-50/80 hover:border-orange-200 transition-colors h-full">
                        <div className="p-2 rounded-md bg-orange-100 shrink-0">
                          <link.icon className="h-5 w-5 text-orange-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{link.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/admin/dashboard">← На главную админки</Link>
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
