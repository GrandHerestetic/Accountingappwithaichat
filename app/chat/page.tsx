"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Circle, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/hooks/use-chat"
import type { Chat, PaginatedResponse } from "@/lib/api/types"

// ---------------------------------------------------------------------------
// Chat list item with unread badge
// ---------------------------------------------------------------------------
interface ChatListItem extends Chat {
  unread_count?: number
  last_message?: string
  last_message_at?: string
  other_participant_name?: string
}

// ---------------------------------------------------------------------------
// Inner chat window — uses useChat hook for real-time messages
// ---------------------------------------------------------------------------
function ChatWindow({ chat, userId }: { chat: ChatListItem; userId: string }) {
  const [messageInput, setMessageInput] = useState("")
  const [sendError, setSendError] = useState<string | null>(null)
  const { messages, sendMessage, handleTyping, isConnected, error } = useChat({
    chatId: chat.id,
    userId,
  })

  // Mark as read on open
  useEffect(() => {
    apiRequest(`/api/v1/my/chats/${chat.id}/read`, { method: "POST" }).catch(() => {})
  }, [chat.id])

  const handleSend = async () => {
    const content = messageInput.trim()
    if (!content) return
    setSendError(null)
    try {
      await sendMessage(content)
      setMessageInput("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось отправить сообщение"
      setSendError(msg)
      // Keep message in input so user can retry
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const otherName = chat.other_participant_name ?? `Чат #${chat.order_id}`

  return (
    <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-140px)]">
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {otherName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{otherName}</h3>
              <p className="text-sm text-gray-500">
                {isConnected ? "В сети" : error ? "Режим опроса" : "Подключение..."}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit">
          Заказ #{chat.order_id}
        </Badge>
        {error && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Обновления в реальном времени недоступны
          </p>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender_id === userId
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-end space-x-2 max-w-[70%] ${
                      isMe ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {!isMe && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {otherName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 break-words ${
                        isMe
                          ? "bg-blue-500 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${isMe ? "text-blue-100" : "text-gray-500"}`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t">
        {sendError && (
          <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {sendError}
          </p>
        )}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
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
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!messageInput.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ChatPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchChats = useCallback(async () => {
    try {
      const data = await apiRequest<PaginatedResponse<Chat>>(
        "/api/v1/my/chats?page=1&page_size=20"
      )
      setChats(data.items as ChatListItem[])
      if (data.items.length > 0 && !selectedChatId) {
        setSelectedChatId(data.items[0].id)
      }
    } catch {
      // Silently ignore — empty state shown
    } finally {
      setLoading(false)
    }
  }, [selectedChatId])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const filteredChats = chats.filter((c) => {
    const name = c.other_participant_name ?? `Заказ #${c.order_id}`
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const selectedChat = chats.find((c) => c.id === selectedChatId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Chat List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Сообщения</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск чатов..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-240px)]">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="text-center py-12 text-sm text-gray-500 px-4">
                    Нет активных чатов
                  </div>
                ) : (
                  filteredChats.map((chat, index) => {
                    const name = chat.other_participant_name ?? `Заказ #${chat.order_id}`
                    const isSelected = chat.id === selectedChatId
                    return (
                      <div key={chat.id}>
                        <div
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
                          }`}
                          onClick={() => setSelectedChatId(chat.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                                {chat.last_message_at && (
                                  <p className="text-xs text-gray-500">
                                    {new Date(chat.last_message_at).toLocaleTimeString("ru-RU", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mb-1">Заказ #{chat.order_id}</p>
                              <div className="flex items-center justify-between">
                                {chat.last_message && (
                                  <p className="text-sm text-gray-600 truncate max-w-[140px]">
                                    {chat.last_message}
                                  </p>
                                )}
                                {(chat.unread_count ?? 0) > 0 && (
                                  <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                                    {chat.unread_count}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < filteredChats.length - 1 && <Separator />}
                      </div>
                    )
                  })
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          {selectedChat && user ? (
            <ChatWindow chat={selectedChat} userId={user.id} />
          ) : (
            <Card className="lg:col-span-3 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Выберите чат для начала общения</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
