"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Bell, BellOff, TestTube, AlertCircle, CheckCircle } from "lucide-react"
import { pushNotificationManager } from "@/lib/push-notifications"

export function PushNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // VAPID публичный ключ (в реальном приложении должен быть в переменных окружения)
  const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI"

  useEffect(() => {
    checkNotificationSupport()
    checkSubscriptionStatus()
  }, [])

  const checkNotificationSupport = () => {
    const supported = pushNotificationManager.isSupported()
    setIsSupported(supported)

    if (supported && typeof window !== "undefined") {
      setPermission(Notification.permission)
    }
  }

  const checkSubscriptionStatus = async () => {
    try {
      const subscription = await pushNotificationManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error("Failed to check subscription status:", error)
      setError("Не удалось проверить статус подписки")
    }
  }

  const handleSubscribe = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const subscription = await pushNotificationManager.subscribe(VAPID_PUBLIC_KEY)
      if (subscription) {
        setIsSubscribed(true)
        setPermission("granted")
      } else {
        setError("Не удалось подписаться на уведомления")
      }
    } catch (error) {
      console.error("Subscription failed:", error)
      setError("Ошибка при подписке на уведомления")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const success = await pushNotificationManager.unsubscribe()
      if (success) {
        setIsSubscribed(false)
      } else {
        setError("Не удалось отписаться от уведомлений")
      }
    } catch (error) {
      console.error("Unsubscribe failed:", error)
      setError("Ошибка при отписке от уведомлений")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      await pushNotificationManager.sendTestNotification()
    } catch (error) {
      console.error("Test notification failed:", error)
      setError("Не удалось отправить тестовое уведомление")
    }
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Разрешено
          </Badge>
        )
      case "denied":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Запрещено
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Не запрошено
          </Badge>
        )
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-gray-500" />
            Push-уведомления недоступны
          </CardTitle>
          <CardDescription>
            Ваш браузер не поддерживает push-уведомления или вы используете приватный режим.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Push-уведомления чата
        </CardTitle>
        <CardDescription>Получайте мгновенные уведомления о новых сообщениях, даже когда сайт закрыт.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ошибки */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Статус разрешений */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Статус разрешений</p>
            <p className="text-sm text-gray-600">Текущее состояние разрешений браузера</p>
          </div>
          {getPermissionBadge()}
        </div>

        {/* Статус подписки */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Подписка на уведомления</p>
            <p className="text-sm text-gray-600">
              {isSubscribed ? "Вы подписаны на уведомления" : "Подписка не активна"}
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading || permission === "denied"}
          />
        </div>

        {/* Кнопки управления */}
        <div className="flex flex-wrap gap-2 pt-4">
          {!isSubscribed && permission !== "denied" && (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Bell className="h-4 w-4" />
              {isLoading ? "Подписка..." : "Включить уведомления"}
            </Button>
          )}

          {isSubscribed && (
            <>
              <Button
                variant="outline"
                onClick={handleTestNotification}
                className="flex items-center gap-2 bg-transparent"
              >
                <TestTube className="h-4 w-4" />
                Тест
              </Button>

              <Button
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                <BellOff className="h-4 w-4" />
                {isLoading ? "Отписка..." : "Отключить"}
              </Button>
            </>
          )}
        </div>

        {/* Информация для пользователя */}
        {permission === "denied" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 mb-1">Уведомления заблокированы</p>
                <p className="text-sm text-red-700">
                  Чтобы включить их, нажмите на иконку замка в адресной строке и разрешите уведомления для этого сайта.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSubscribed && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 mb-1">Уведомления активны!</p>
                <p className="text-sm text-green-700">Вы будете получать push-уведомления о новых сообщениях в чате.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
