// Service Worker для push-уведомлений
const CACHE_NAME = "buhpro-chat-v1"
const urlsToCache = ["/", "/chat", "/offline.html"]

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Активация Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Обработка push-уведомлений
self.addEventListener("push", (event) => {
  console.log("Push event received:", event)

  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      console.log("Push data is not JSON, using text:", event.data.text())
      data = { title: "Новое сообщение", body: event.data.text() }
    }
  }

  const options = {
    title: data.title || "BuhPro Chat",
    body: data.body || "У вас новое сообщение",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    image: data.image,
    data: {
      url: data.url || "/chat",
      chatId: data.chatId,
      senderId: data.senderId,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "reply",
        title: "Ответить",
        icon: "/reply-icon.png",
      },
      {
        action: "view",
        title: "Открыть чат",
        icon: "/view-icon.png",
      },
    ],
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    tag: `chat-${data.chatId || "general"}`,
  }

  event.waitUntil(self.registration.showNotification(options.title, options))
})

// Обработка кликов по уведомлениям
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event)

  event.notification.close()

  const action = event.action
  const data = event.notification.data

  if (action === "reply") {
    // Открыть чат для быстрого ответа
    event.waitUntil(clients.openWindow(`/chat/${data.chatId}?reply=true`))
  } else if (action === "view" || !action) {
    // Открыть чат
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Проверяем, есть ли уже открытое окно
        for (const client of clientList) {
          if (client.url.includes("/chat") && "focus" in client) {
            return client.focus()
          }
        }
        // Если нет открытого окна, открываем новое
        if (clients.openWindow) {
          return clients.openWindow(data.url)
        }
      }),
    )
  }
})

// Обработка закрытия уведомлений
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification.tag)

  // Отправляем аналитику о закрытии уведомления
  event.waitUntil(
    fetch("/api/notifications/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "close",
        tag: event.notification.tag,
        timestamp: Date.now(),
      }),
    }).catch((error) => {
      console.log("Analytics request failed:", error)
    }),
  )
})

// Обработка фоновой синхронизации
self.addEventListener("sync", (event) => {
  console.log("Background sync event:", event.tag)
  if (event.tag === "background-sync-messages") {
    event.waitUntil(syncMessages())
  }
})

// Функция синхронизации сообщений
async function syncMessages() {
  try {
    console.log("Syncing messages...")
    const response = await fetch("/api/chat/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log("Sync response:", data)

      // Показываем уведомления о новых сообщениях
      if (data.newMessages && data.newMessages.length > 0) {
        for (const message of data.newMessages) {
          await self.registration.showNotification("Новое сообщение", {
            body: `${message.senderName}: ${message.text}`,
            icon: "/icon-192x192.png",
            data: {
              url: `/chat/${message.chatId}`,
              chatId: message.chatId,
              senderId: message.senderId,
            },
          })
        }
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}

// Обработка fetch запросов (кэширование)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Возвращаем кэшированную версию или делаем запрос к сети
      return response || fetch(event.request)
    }),
  )
})
