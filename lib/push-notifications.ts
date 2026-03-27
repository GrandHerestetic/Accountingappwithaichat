// Утилиты для работы с push-уведомлениями

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  image?: string
  url?: string
  chatId?: string
  senderId?: string
  data?: any
}

export class PushNotificationManager {
  private static instance: PushNotificationManager
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  // Проверка поддержки push-уведомлений
  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    )
  }

  // Регистрация Service Worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn("Push notifications are not supported")
      return null
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })

      console.log("Service Worker registered successfully:", this.registration)

      // Ждем активации Service Worker
      await navigator.serviceWorker.ready

      return this.registration
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      return null
    }
  }

  // Запрос разрешения на уведомления
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return "denied"
    }

    const permission = await Notification.requestPermission()
    console.log("Notification permission:", permission)
    return permission
  }

  // Подписка на push-уведомления
  async subscribe(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker()
    }

    if (!this.registration) {
      console.error("Service Worker not registered")
      return null
    }

    try {
      const permission = await this.requestPermission()
      if (permission !== "granted") {
        console.warn("Notification permission not granted")
        return null
      }

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      })

      console.log("Push subscription successful:", this.subscription)

      // Сохраняем подписку на сервере
      await this.saveSubscription(this.subscription)

      return this.subscription
    } catch (error) {
      console.error("Push subscription failed:", error)
      return null
    }
  }

  // Отписка от push-уведомлений
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true
    }

    try {
      const success = await this.subscription.unsubscribe()
      if (success) {
        // Удаляем подписку с сервера
        await this.removeSubscription(this.subscription)
        this.subscription = null
      }
      return success
    } catch (error) {
      console.error("Push unsubscribe failed:", error)
      return false
    }
  }

  // Получение текущей подписки
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker()
    }

    if (!this.registration) {
      return null
    }

    try {
      this.subscription = await this.registration.pushManager.getSubscription()
      return this.subscription
    } catch (error) {
      console.error("Failed to get subscription:", error)
      return null
    }
  }

  // Отправка тестового уведомления
  async sendTestNotification(): Promise<void> {
    if (!this.subscription) {
      console.warn("No active subscription")
      return
    }

    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: this.subscription,
          payload: {
            title: "Тестовое уведомление",
            body: "Push-уведомления работают корректно!",
            icon: "/icon-192x192.png",
            url: "/chat",
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log("Test notification sent successfully")
    } catch (error) {
      console.error("Failed to send test notification:", error)
    }
  }

  // Сохранение подписки на сервере
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")),
              auth: this.arrayBufferToBase64(subscription.getKey("auth")),
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log("Subscription saved successfully")
    } catch (error) {
      console.error("Failed to save subscription:", error)
    }
  }

  // Удаление подписки с сервера
  private async removeSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log("Subscription removed successfully")
    } catch (error) {
      console.error("Failed to remove subscription:", error)
    }
  }

  // Конвертация VAPID ключа
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Конвертация ArrayBuffer в Base64
  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return ""

    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

// Экспорт singleton instance
export const pushNotificationManager = PushNotificationManager.getInstance()
