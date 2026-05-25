"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PushNotificationSetup } from "@/components/push-notification-setup"
import { User, Bell, Save, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { clearProfileAvatar, getProfile, setProfileAvatar, updateProfile, uploadFiles } from "@/lib/api"
import { FileUploadField } from "@/components/file-upload-field"
import { useAuth } from "@/contexts/auth-context"
import { FormField, fieldAriaProps, fieldInputClass } from "@/components/form-field"
import {
  clearFieldError,
  type FieldErrors,
  validateMinLength,
  validatePhone,
} from "@/lib/form-errors"
import { toast } from "sonner"

type SettingsField = "display_name" | "phone" | "about" | "company_name"

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FieldErrors<SettingsField>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    about: "",
    company_name: "",
  })

  useEffect(() => {
    getProfile()
      .then((p) => {
        setForm({
          display_name: String(p.display_name ?? p.profile_name ?? user?.profile?.profile_name ?? ""),
          phone: String(p.phone ?? ""),
          about: String(p.about ?? p.bio ?? ""),
          company_name: String(p.company_name ?? ""),
        })
      })
      .catch(() => {
        setForm({
          display_name: user?.profile?.profile_name ?? "",
          phone: String(user?.profile?.phone ?? ""),
          about: String(user?.profile?.about ?? ""),
          company_name: String(user?.profile?.company_name ?? ""),
        })
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleAvatarSave = async () => {
    if (!avatarFile) return
    setAvatarSaving(true)
    try {
      const [upload] = await uploadFiles([avatarFile])
      await setProfileAvatar(upload.id)
      await refreshUser()
      setAvatarFile(null)
      toast.success("Аватар обновлён")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки аватара")
    } finally {
      setAvatarSaving(false)
    }
  }

  const handleAvatarClear = async () => {
    setAvatarSaving(true)
    try {
      await clearProfileAvatar()
      await refreshUser()
      toast.success("Аватар удалён")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setAvatarSaving(false)
    }
  }

  const handleSave = async () => {
    const nextErrors: FieldErrors<SettingsField> = {
      display_name: validateMinLength(form.display_name, 2, "Укажите имя или название"),
      phone: validatePhone(form.phone),
      about: form.about.trim() ? validateMinLength(form.about, 10, "Описание — минимум 10 символов") : undefined,
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSaving(true)
    try {
      await updateProfile({
        display_name: form.display_name.trim(),
        phone: form.phone.trim(),
        about: form.about.trim(),
        company_name: form.company_name.trim(),
      })
      await refreshUser()
      toast.success("Профиль сохранён")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field in errors) {
      setErrors((prev) => clearFieldError(prev, field as SettingsField))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Настройки</h1>

        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Профиль
                </CardTitle>
                <CardDescription>Данные из API /api/v1/profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Аватар</Label>
                  <FileUploadField
                    label="Загрузить фото профиля"
                    hint="JPG, PNG до 5MB"
                    value={avatarFile}
                    onChange={setAvatarFile}
                    accept="image/jpeg,image/png,image/webp"
                    disabled={avatarSaving}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!avatarFile || avatarSaving}
                      onClick={handleAvatarSave}
                    >
                      {avatarSaving ? "Загрузка..." : "Применить аватар"}
                    </Button>
                    {user?.profile?.avatar_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={avatarSaving}
                        onClick={handleAvatarClear}
                      >
                        Удалить аватар
                      </Button>
                    )}
                  </div>
                </div>
                <FormField label="Email">
                  <Input value={user?.email ?? ""} disabled />
                </FormField>
                <FormField label="Имя / название" htmlFor="display_name" error={errors.display_name} required>
                  <Input
                    id="display_name"
                    value={form.display_name}
                    onChange={(e) => updateForm("display_name", e.target.value)}
                    className={fieldInputClass(errors.display_name)}
                    {...fieldAriaProps(errors.display_name, "display_name")}
                  />
                </FormField>
                <FormField label="Телефон" htmlFor="phone" error={errors.phone}>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className={fieldInputClass(errors.phone)}
                    {...fieldAriaProps(errors.phone, "phone")}
                  />
                </FormField>
                <FormField label="О компании" htmlFor="company_name">
                  <Input
                    id="company_name"
                    value={form.company_name}
                    onChange={(e) => updateForm("company_name", e.target.value)}
                  />
                </FormField>
                <FormField label="О себе" htmlFor="about" error={errors.about}>
                  <Input
                    id="about"
                    value={form.about}
                    onChange={(e) => updateForm("about", e.target.value)}
                    className={fieldInputClass(errors.about)}
                    {...fieldAriaProps(errors.about, "about")}
                  />
                </FormField>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Сохранить
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Уведомления
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PushNotificationSetup />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
