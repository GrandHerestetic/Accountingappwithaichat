"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  CheckCircle,
  Star,
  Calendar,
  DollarSign,
  Clock,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function ExecutorOrderChatPage({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState("")
  const [workProgress, setWorkProgress] = useState(65)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "client",
      content: "Здравствуйте! Когда планируете начать работу?",
      timestamp: "2024-01-20T10:30:00",
      read: true,
    },
    {
      id: 2,
      sender: "executor",
      content: "Добрый день! Могу приступить уже сегодня. Пришлите, пожалуйста, необходимые документы.",
      timestamp: "2024-01-20T10:32:00",
      read: true,
    },
    {
      id: 3,
      sender: "client",
      content: "Отлично! Высылаю документы. Какие еще материалы вам понадобятся?",
      timestamp: "2024-01-20T10:35:00",
      read: true,
    },
    {
      id: 4,
      sender: "executor",
      content: "Спасибо! Также нужны банковские выписки за последние 3 месяца и договоры с контрагентами.",
      timestamp: "2024-01-20T10:38:00",
      read: true,
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock order data
  const order = {
    id: Number.parseInt(params.id),
    title: "Ведение бухгалтерского учета для ТОО",
    client: {
      name: "ТОО 'Алматы Строй'",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
      rating: 4.8,
    },
    budget: "50000 ₸",
    deadline: "2024-02-15",
    startDate: "2024-01-15",
    status: "in_progress",
    description: "Ведение полного бухгалтерского учета для строительной компании",
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "executor" as const,
        content: message,
        timestamp: new Date().toISOString(),
        read: false,
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCompleteWork = () => {
    if (confirm("Вы уверены, что работа выполнена полностью?")) {
      alert("Заказчик получил уведомление о завершении работы!")
      // Здесь будет логика завершения работы
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <Navigation userType="executor" userName="Марат Абдуллаев" notifications={7} />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Link href="/executor/dashboard">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к заказам
            </Button>
          </Link>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Order Info Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Информация о заказе</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{order.title}</h3>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>{order.budget}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>До {new Date(order.deadline).toLocaleDateString("ru-RU")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Начат {new Date(order.startDate).toLocaleDateString("ru-RU")}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Заказчик</h4>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={order.client.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {order.client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {order.client.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.client.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{order.client.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Прогресс работы</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Выполнено:</span>
                        <span className="font-medium">{workProgress}%</span>
                      </div>
                      <Progress value={workProgress} />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setWorkProgress(Math.min(100, workProgress + 10))}
                        >
                          +10%
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setWorkProgress(Math.max(0, workProgress - 10))}
                        >
                          -10%
                        </Button>
                      </div>
                    </div>
                  </div>

                  {order.status === "in_progress" && (
                    <div className="pt-4 border-t space-y-2">
                      <Button className="w-full" variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Загрузить файлы
                      </Button>
                      <Button onClick={handleCompleteWork} className="w-full bg-green-600 hover:bg-green-700">
                        Завершить работу
                      </Button>
                    </div>
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
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={order.client.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {order.client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {order.client.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{order.client.name}</h3>
                        <p className="text-sm text-gray-600">{order.client.online ? "В сети" : "Был в сети недавно"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "executor" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === "executor" ? "bg-green-600 text-white" : "bg-white border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span
                              className={`text-xs ${msg.sender === "executor" ? "text-green-100" : "text-gray-500"}`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString("ru-RU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {msg.sender === "executor" && (
                              <CheckCircle className={`w-3 h-3 ${msg.read ? "text-green-200" : "text-green-300"}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Введите сообщение..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-12"
                      />
                    </div>
                    <Button onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Нажмите Enter для отправки сообщения</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
