"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Send,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/hooks/use-chat"
import { getMyChat, listMyChats, markChatRead } from "@/lib/api"
import type { Chat } from "@/lib/api/types"

export default function OrderChatPage({ params }: { params: { orderId: string } }) {
  const { user } = useAuth()
  const [messageInput, setMessageInput] = useState("")
  const [chat, setChat] = useState<Chat | null>(null)
  const [loadingChat, setLoadingChat] = useState(true)
  const [sendError, setSendError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [chatId, setChatId] = useState<string | null>(null)

  const { messages, sendMessage, handleTyping, isConnected, error } = useChat({
    chatId: chatId ?? "",
    userId: user?.id ?? "",
  })

  // Fetch chat metadata
  const fetchChat = useCallback(async () => {
    try {
      const orderOrChatId = params.orderId
      const data = await listMyChats({ page: 1, pageSize: 100 })
      const found =
        data.items.find((c) => c.id === orderOrChatId) ??
        data.items.find((c) => c.order_id === orderOrChatId)
      if (found?.id) {
        setChat(found)
        setChatId(found.id)
        return
      }

      try {
        const detail = await getMyChat(orderOrChatId)
        setChat(detail)
        setChatId(detail.id)
      } catch {
        // chat not found for this order/id
      }
    } catch {
      // ignore
    } finally {
      setLoadingChat(false)
    }
  }, [params.orderId])

  useEffect(() => {
    fetchChat()
  }, [fetchChat])

  useEffect(() => {
    if (chatId) markChatRead(chatId).catch(() => {})
  }, [chatId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    const content = messageInput.trim()
    if (!content) return
    setSendError(null)
    try {
      await sendMessage(content)
      setMessageInput("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось отправить сообщение"
      setSendError(msg)
      toast.error(msg)
      // Keep message in input so user can retry
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">В работе</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Завершен</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const otherParticipantId = chat?.participant_ids?.find((id) => id !== user?.id)
  const chatTitle = chat ? `Заказ #${chat.order_id}` : `Чат #${chatId}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Link href="/chat">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к чатам
            </Button>
          </Link>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Order Info Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Информация о чате</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingChat ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-medium mb-2">{chatTitle}</h3>
                        {chat && getStatusBadge("in_progress")}
                      </div>

                      {chat && (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>
                              Создан{" "}
                              {new Date(chat.created_at).toLocaleDateString("ru-RU")}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t space-y-2">
                        {chat?.order_id && (
                          <Link href={`/orders/${chat.order_id}`}>
                            <Button className="w-full" variant="outline">
                              Перейти к заказу
                            </Button>
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {chatTitle
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{chatTitle}</h3>
                        <p className="text-sm text-gray-600">
                          {isConnected
                            ? "Подключено"
                            : error
                            ? "Режим опроса"
                            : "Подключение..."}
                        </p>
                      </div>
                    </div>

                  </div>
                  {error && (
                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Обновления в реальном времени недоступны — используется опрос
                    </p>
                  )}
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id
                      const isDeleted = Boolean(msg.deleted_at)
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isMe
                                ? "bg-green-600 text-white"
                                : "bg-white border border-gray-200"
                            } ${isDeleted ? "opacity-60 italic" : ""}`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div className="flex items-center justify-end gap-1 mt-1 flex-wrap">
                              {msg.edited_at && !isDeleted && (
                                <span className={`text-xs ${isMe ? "text-green-100" : "text-gray-400"}`}>
                                  изм.
                                </span>
                              )}
                              <span
                                className={`text-xs ${
                                  isMe ? "text-green-100" : "text-gray-500"
                                }`}
                              >
                                {new Date(msg.created_at).toLocaleTimeString("ru-RU", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMe && (
                                <CheckCircle
                                  className={`w-3 h-3 ${
                                    msg.is_read ? "text-green-200" : "text-green-300"
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  {sendError && (
                    <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {sendError}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Введите сообщение..."
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value)
                          handleTyping()
                        }}
                        onKeyPress={handleKeyPress}
                        className="pr-12"
                      />
                    </div>
                    <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Нажмите Enter для отправки сообщения
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
