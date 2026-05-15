"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PushNotificationSetup } from "@/components/push-notification-setup"
import { User, Bell, Save, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getProfile, updateProfile } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        display_name: form.display_name,
        phone: form.phone,
        about: form.about,
        company_name: form.company_name,
      })
      await refreshUser()
      toast.success("Профиль сохранён")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
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
                  <Label>Email</Label>
                  <Input value={user?.email ?? ""} disabled />
                </div>
                <div>
                  <Label>Имя / название</Label>
                  <Input
                    value={form.display_name}
                    onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Телефон</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>О компании</Label>
                  <Input
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>О себе</Label>
                  <Input
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                  />
                </div>
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
