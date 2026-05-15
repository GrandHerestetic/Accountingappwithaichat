"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  MessageCircle,
  Star,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  Clock,
  BookOpen,
  ShieldAlert,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useNotificationsPolling } from "@/hooks/use-notifications-polling"
import type { Notification, NotificationType, PaginatedResponse } from "@/lib/api/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "order_published":
      return { Icon: Briefcase, color: "text-blue-600" }
    case "response_submitted":
      return { Icon: MessageCircle, color: "text-blue-600" }
    case "response_selected":
      return { Icon: CheckCircle, color: "text-green-600" }
    case "order_completed":
      return { Icon: CheckCircle, color: "text-green-600" }
    case "review_created":
      return { Icon: Star, color: "text-yellow-600" }
    case "sanction_created":
      return { Icon: ShieldAlert, color: "text-red-600" }
    case "course_assigned":
      return { Icon: BookOpen, color: "text-purple-600" }
    case "course_completed":
      return { Icon: BookOpen, color: "text-purple-600" }
    case "chat_message_received":
      return { Icon: MessageCircle, color: "text-indigo-600" }
    default:
      return { Icon: Bell, color: "text-gray-600" }
  }
}

function getNotificationTitle(type: NotificationType): string {
  switch (type) {
    case "order_published":
      return "Новый заказ опубликован"
    case "response_submitted":
      return "Новый отклик на ваш заказ"
    case "response_selected":
      return "Вас выбрали исполнителем"
    case "order_completed":
      return "Заказ завершён"
    case "review_created":
      return "Новая оценка"
    case "sanction_created":
      return "Санкция применена"
    case "course_assigned":
      return "Вам назначен курс"
    case "course_completed":
      return "Курс завершён"
    case "chat_message_received":
      return "Новое сообщение в чате"
    default:
      return "Уведомление"
  }
}

function formatTimestamp(createdAt: string): string {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays >= 7) {
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
  }
  if (diffDays >= 1) return `${diffDays} ${diffDays === 1 ? "день" : diffDays < 5 ? "дня" : "дней"} назад`
  if (diffHours >= 1) return `${diffHours} ${diffHours === 1 ? "час" : diffHours < 5 ? "часа" : "часов"} назад`
  if (diffMinutes >= 1) return `${diffMinutes} ${diffMinutes === 1 ? "минуту" : diffMinutes < 5 ? "минуты" : "минут"} назад`
  return "только что"
}

// ---------------------------------------------------------------------------
// Types for tab filtering
// ---------------------------------------------------------------------------
type TabValue = "all" | "unread" | "orders" | "chat" | "courses"

const ORDER_TYPES: NotificationType[] = [
  "order_published",
  "response_submitted",
  "response_selected",
  "order_completed",
  "review_created",
]

const CHAT_TYPES: NotificationType[] = ["chat_message_received"]

const COURSE_TYPES: NotificationType[] = ["course_assigned", "course_completed", "sanction_created"]

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabValue>("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const PAGE_SIZE = 20

  // ---------------------------------------------------------------------------
  // Fetch notifications
  // ---------------------------------------------------------------------------
  const fetchNotifications = useCallback(
    async (pageNum: number, replace: boolean) => {
      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          page_size: String(PAGE_SIZE),
        })

        if (activeTab === "unread") {
          params.set("unread_only", "true")
        } else if (activeTab === "orders") {
          // fetch all and filter client-side (API supports single type param)
          // no extra filter — we'll filter locally
        } else if (activeTab === "chat") {
          params.set("type", "chat_message_received")
        } else if (activeTab === "courses") {
          // filter locally
        }

        const data = await listMyNotifications({
          page,
          pageSize: 20,
          unreadOnly: params.get("unread_only") === "true",
          type: params.get("type") ?? undefined,
          status: params.get("status") ?? undefined,
        })

        setTotal(data.total)
        setNotifications((prev) => (replace ? data.items : [...prev, ...data.items]))
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не удалось загрузить уведомления"
        toast.error(message)
      }
    },
    [activeTab]
  )

  // Re-fetch when tab changes
  useEffect(() => {
    setPage(1)
    setLoading(true)
    fetchNotifications(1, true).finally(() => setLoading(false))
  }, [activeTab, fetchNotifications])

  // ---------------------------------------------------------------------------
  // Load more
  // ---------------------------------------------------------------------------
  const handleLoadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    await fetchNotifications(nextPage, false)
    setPage(nextPage)
    setLoadingMore(false)
  }

  // ---------------------------------------------------------------------------
  // Mark single notification as read (optimistic)
  // ---------------------------------------------------------------------------
  const markAsRead = async (id: string) => {
    const prev = notifications.find((n) => n.id === id)
    if (!prev || prev.status === "read") return

    // Optimistic update
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, status: "read" as const, read_at: new Date().toISOString() } : n))
    )

    try {
      await markNotificationRead(id)
    } catch (err) {
      // Revert
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, status: prev.status, read_at: prev.read_at } : n)))
      const message = err instanceof Error ? err.message : "Не удалось отметить уведомление как прочитанное"
      toast.error(message)
    }
  }

  // ---------------------------------------------------------------------------
  // Mark all as read (optimistic)
  // ---------------------------------------------------------------------------
  const markAllAsRead = async () => {
    const snapshot = notifications.map((n) => ({ ...n }))

    // Optimistic update
    setNotifications((ns) =>
      ns.map((n) => ({ ...n, status: "read" as const, read_at: n.read_at ?? new Date().toISOString() }))
    )

    try {
      await markAllNotificationsRead()
    } catch (err) {
      // Revert
      setNotifications(snapshot)
      const message = err instanceof Error ? err.message : "Не удалось отметить все уведомления как прочитанные"
      toast.error(message)
    }
  }

  // ---------------------------------------------------------------------------
  // Handle notification click: mark as read + navigate
  // ---------------------------------------------------------------------------
  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id)

    const { payload } = notification
    if (payload?.order_id) {
      const role = user?.role
      if (role === "client") {
        router.push(`/client/order/${payload.order_id}`)
      } else {
        router.push(`/executor/order/${payload.order_id}`)
      }
    } else if (payload?.chat_id) {
      router.push(`/chat/${payload.chat_id}`)
    }
    // If no navigation fields, stay on page (notification detail shown inline)
  }

  // ---------------------------------------------------------------------------
  // Filtered list for display
  // ---------------------------------------------------------------------------
  const displayedNotifications = notifications.filter((n) => {
    if (activeTab === "orders") return ORDER_TYPES.includes(n.type)
    if (activeTab === "chat") return CHAT_TYPES.includes(n.type)
    if (activeTab === "courses") return COURSE_TYPES.includes(n.type)
    return true
  })

  const unreadCount = notifications.filter((n) => n.status === "unread").length
  const todayCount = notifications.filter((n) => {
    const today = new Date()
    const d = new Date(n.created_at)
    return d.toDateString() === today.toDateString()
  }).length

  const hasMore = notifications.length < total

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">BuhPro</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/executor/dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Дашборд
          </Link>
          <Link href="/notifications" className="text-sm font-medium text-blue-600">
            Уведомления
          </Link>
        </nav>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Уведомления</h1>
              <p className="text-gray-600">Будьте в курсе всех важных событий</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
                Отметить все как прочитанные
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Bell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-sm text-gray-600">Всего</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-red-600 font-bold text-sm">{unreadCount}</span>
                </div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-gray-600">Непрочитанные</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{todayCount}</p>
                <p className="text-sm text-gray-600">Сегодня</p>
              </CardContent>
            </Card>
          </div>

          {/* Notifications list */}
          <Card>
            <CardHeader>
              <CardTitle>Все уведомления</CardTitle>
              <CardDescription>Просматривайте и управляйте своими уведомлениями</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as TabValue)}
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="unread">Непрочитанные</TabsTrigger>
                  <TabsTrigger value="orders">Заказы</TabsTrigger>
                  <TabsTrigger value="chat">Чат</TabsTrigger>
                  <TabsTrigger value="courses">Курсы</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4 mt-6">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : displayedNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Нет уведомлений</h3>
                      <p className="text-gray-600">
                        {activeTab === "unread"
                          ? "Все уведомления прочитаны"
                          : "В этой категории пока нет уведомлений"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {displayedNotifications.map((notification) => {
                        const { Icon, color } = getNotificationIcon(notification.type)
                        const isUnread = notification.status === "unread"
                        return (
                          <Card
                            key={notification.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isUnread ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-full bg-gray-100 shrink-0">
                                  <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2 gap-2">
                                    <div className="min-w-0">
                                      <h4 className={`font-medium truncate ${isUnread ? "font-semibold" : ""}`}>
                                        {getNotificationTitle(notification.type)}
                                      </h4>
                                      {notification.payload?.message && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {notification.payload.message}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {isUnread && (
                                        <Badge className="bg-blue-100 text-blue-800">Новое</Badge>
                                      )}
                                      {isUnread && (
                                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-sm text-gray-500 flex-wrap gap-2">
                                    <span>{formatTimestamp(notification.created_at)}</span>
                                    <div className="flex items-center gap-4">
                                      {notification.payload?.order_id && (
                                        <span>Заказ #{notification.payload.order_id}</span>
                                      )}
                                      {notification.payload?.chat_id && (
                                        <span>Чат #{notification.payload.chat_id}</span>
                                      )}
                                      {isUnread && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            markAsRead(notification.id)
                                          }}
                                        >
                                          Отметить как прочитанное
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}

                      {hasMore && (
                        <div className="flex justify-center pt-4">
                          <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                          >
                            {loadingMore ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Загрузка...
                              </>
                            ) : (
                              "Загрузить ещё"
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
