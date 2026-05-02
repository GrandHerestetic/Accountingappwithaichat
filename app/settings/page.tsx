"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { PushNotificationSetup } from "@/components/push-notification-setup"
import { User, Bell, Shield, Palette, Save, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    // Профиль
    name: "Иван Петров",
    email: "ivan.petrov@example.com",
    phone: "+7 (777) 123-45-67",

    // Уведомления
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    chatNotifications: true,
    orderNotifications: true,

    // Приватность
    profileVisible: true,
    showOnlineStatus: true,
    allowDirectMessages: true,

    // Интерфейс
    darkMode: false,
    language: "ru",
    compactMode: false,
  })

  const handleSave = () => {
    // Здесь будет логика сохранения настроек
    alert("Настройки сохранены!")
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
          <p className="text-gray-600 mt-2">Управляйте своим аккаунтом и предпочтениями</p>
        </div>

        <div className="space-y-6">
          {/* Профиль */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Профиль
              </CardTitle>
              <CardDescription>Основная информация о вашем аккаунте</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Имя</Label>
                  <Input id="name" value={settings.name} onChange={(e) => updateSetting("name", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting("email", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" value={settings.phone} onChange={(e) => updateSetting("phone", e.target.value)} />
              </div>

              <div>
                <Label htmlFor="password">Новый пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Оставьте пустым, чтобы не менять"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Push-уведомления */}
          <PushNotificationSetup />

          {/* Уведомления */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Уведомления
              </CardTitle>
              <CardDescription>Настройте, как вы хотите получать уведомления</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email уведомления</p>
                  <p className="text-sm text-gray-600">Получать уведомления на email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS уведомления</p>
                  <p className="text-sm text-gray-600">Получать SMS о важных событиях</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Уведомления чата</p>
                  <p className="text-sm text-gray-600">Уведомления о новых сообщениях</p>
                </div>
                <Switch
                  checked={settings.chatNotifications}
                  onCheckedChange={(checked) => updateSetting("chatNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Уведомления о заказах</p>
                  <p className="text-sm text-gray-600">Уведомления об изменениях в заказах</p>
                </div>
                <Switch
                  checked={settings.orderNotifications}
                  onCheckedChange={(checked) => updateSetting("orderNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Приватность */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Приватность
              </CardTitle>
              <CardDescription>Управляйте видимостью вашего профиля</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Видимость профиля</p>
                  <p className="text-sm text-gray-600">Показывать профиль другим пользователям</p>
                </div>
                <Switch
                  checked={settings.profileVisible}
                  onCheckedChange={(checked) => updateSetting("profileVisible", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Статус онлайн</p>
                  <p className="text-sm text-gray-600">Показывать когда вы в сети</p>
                </div>
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) => updateSetting("showOnlineStatus", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Прямые сообщения</p>
                  <p className="text-sm text-gray-600">Разрешить другим писать вам напрямую</p>
                </div>
                <Switch
                  checked={settings.allowDirectMessages}
                  onCheckedChange={(checked) => updateSetting("allowDirectMessages", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Интерфейс */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Интерфейс
              </CardTitle>
              <CardDescription>Настройте внешний вид приложения</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Темная тема</p>
                  <p className="text-sm text-gray-600">Использовать темное оформление</p>
                </div>
                <Switch checked={settings.darkMode} onCheckedChange={(checked) => updateSetting("darkMode", checked)} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Компактный режим</p>
                  <p className="text-sm text-gray-600">Уменьшить отступы и размеры элементов</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="language">Язык интерфейса</Label>
                <select
                  id="language"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  value={settings.language}
                  onChange={(e) => updateSetting("language", e.target.value)}
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="kz">Қазақша</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Кнопка сохранения */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Сохранить настройки
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
