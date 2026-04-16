"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MessageCircle, CheckCircle, XCircle, Eye, Flag, Scale } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function AdminDisputesPage() {
  const [activeTab, setActiveTab] = useState("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  // Mock data for disputes
  const disputes = [
    {
      id: 1,
      orderId: 1234,
      orderTitle: "Ведение бухгалтерского учета для ТОО",
      client: {
        name: "ТОО 'Алматы Строй'",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      executor: {
        name: "Айгуль Нурланова",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      type: "quality",
      status: "active",
      priority: "high",
      amount: 45000,
      createdDate: "2024-01-18",
      lastUpdate: "2024-01-19",
      description: "Клиент недоволен качеством выполненной работы. Утверждает, что отчетность содержит ошибки.",
      clientMessage: "Исполнитель предоставил отчетность с множественными ошибками. Требую возврат средств.",
      executorMessage:
        "Все работы выполнены согласно техническому заданию. Клиент предъявляет необоснованные претензии.",
      evidence: ["Скриншоты отчетов", "Переписка в чате", "Техническое задание"],
      assignedTo: "Админ #1",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-red-100 text-red-800">Активный</Badge>
      case "investigating":
        return <Badge className="bg-yellow-100 text-yellow-800">Расследование</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Ожидает</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Решен</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Закрыт</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управление спорами и жалобами</h1>
              <p className="text-gray-600">Разрешайте конфликты и модерируйте жалобы пользователей</p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Scale className="w-4 h-4 mr-2" />
              Создать решение
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск споров и жалоб..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Сначала новые</SelectItem>
                      <SelectItem value="priority">По приоритету</SelectItem>
                      <SelectItem value="amount">По сумме</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disputes and Complaints */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">
                    Активные споры ({disputes.filter((d) => d.status === "active").length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved">
                    Решенные споры ({disputes.filter((d) => d.status === "resolved").length})
                  </TabsTrigger>
                  <TabsTrigger value="complaints">Жалобы (0)</TabsTrigger>
                </TabsList>

                {/* Active Disputes */}
                <TabsContent value="active" className="space-y-6 mt-6">
                  {disputes
                    .filter((d) => d.status === "active")
                    .map((dispute) => (
                      <Card key={dispute.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  Спор #{dispute.id} - Заказ #{dispute.orderId}
                                </h3>
                                {getStatusBadge(dispute.status)}
                              </div>
                              <p className="text-gray-600 mb-2">{dispute.orderTitle}</p>
                              <p className="text-sm text-gray-500">
                                Создан: {new Date(dispute.createdDate).toLocaleDateString("ru-RU")} | Обновлен:{" "}
                                {new Date(dispute.lastUpdate).toLocaleDateString("ru-RU")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-600">{dispute.amount.toLocaleString()} ₸</p>
                              <p className="text-sm text-gray-500">Сумма спора</p>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">{dispute.description}</p>

                          {/* Actions */}
                          <div className="flex gap-3 pt-4 border-t">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Детали заказа
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Связаться со сторонами
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Scale className="w-4 h-4 mr-1" />
                              Принять решение
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <XCircle className="w-4 h-4 mr-1" />
                              Закрыть спор
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>

                <TabsContent value="resolved" className="space-y-6 mt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Нет решенных споров</h3>
                    <p className="text-gray-600">Решенные споры будут отображаться здесь</p>
                  </div>
                </TabsContent>

                <TabsContent value="complaints" className="space-y-6 mt-6">
                  <div className="text-center py-8">
                    <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Нет жалоб</h3>
                    <p className="text-gray-600">Новые жалобы будут отображаться здесь</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
