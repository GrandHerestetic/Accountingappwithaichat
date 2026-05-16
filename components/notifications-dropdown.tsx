"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  MessageCircle,
  Star,
  DollarSign,
  CheckCircle,
  Eye,
  Briefcase,
  BookOpen,
  ShieldAlert,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { listMyNotifications, markNotificationRead } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useNotificationsPolling } from "@/hooks/use-notifications-polling"
import type { Notification, NotificationType, PaginatedResponse } from "@/lib/api/types"

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

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) return `${diffInMinutes} мин назад`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`
  return `${Math.floor(diffInMinutes / 1440)} дн назад`
}

export function NotificationsDropdown() {
  const router = useRouter()
  const { user } = useAuth()
  const { unreadCount } = useNotificationsPolling()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Fetch recent notifications when dropdown opens
  const fetchRecent = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listMyNotifications({ page: 1, pageSize: 5 })
      setNotifications(data.items)
    } catch {
      // Silently ignore — badge count from polling is still shown
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchRecent()
    }
  }, [open, fetchRecent])

  const markAsRead = async (notification: Notification) => {
    if (notification.status === "read") return

    // Optimistic update
    setNotifications((ns) =>
      ns.map((n) =>
        n.id === notification.id
          ? { ...n, status: "read" as const, read_at: new Date().toISOString() }
          : n
      )
    )

    try {
      await markNotificationRead(notification.id)
    } catch (err) {
      // Revert
      setNotifications((ns) =>
        ns.map((n) =>
          n.id === notification.id
            ? { ...n, status: notification.status, read_at: notification.read_at }
            : n
        )
      )
      const message = err instanceof Error ? err.message : "Не удалось отметить уведомление"
      toast.error(message)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification)
    setOpen(false)

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
    } else {
      router.push("/notifications")
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 hover:bg-red-600 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Уведомления</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} новых
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-sm text-gray-500">
              <Bell className="w-6 h-6 mb-2 text-gray-300" />
              Нет уведомлений
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => {
                const { Icon, color } = getNotificationIcon(notification.type)
                const isUnread = notification.status === "unread"
                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      isUnread ? "bg-blue-50/50 border-l-2 border-l-blue-500" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-full bg-gray-100 flex-shrink-0">
                        <Icon className={`w-3 h-3 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-sm leading-tight ${
                              isUnread ? "font-semibold" : "font-medium"
                            }`}
                          >
                            {getNotificationTitle(notification.type)}
                          </h4>
                          {isUnread && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        {notification.payload?.message && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.payload.message}
                          </p>
                        )}
                        <span className="text-xs text-gray-500 mt-2 block">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className="p-2">
          <Link href="/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-center text-sm">
              <Eye className="w-4 h-4 mr-2" />
              Посмотреть все уведомления
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
