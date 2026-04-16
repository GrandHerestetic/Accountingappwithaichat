"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Flag } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const orders = [
    {
      id: 1234,
      title: "Ведение бухгалтерского учета для ТОО",
      client: "ТОО 'Алматы Строй'",
      executor: "Айгуль Нурланова",
      category: "Ведение учета",
      budget: 45000,
      status: "in_progress",
      priority: "normal",
      createdDate: "2024-01-15",
      deadline: "2024-02-15",
      responses: 12,
      flags: 0,
      description: "Требуется ведение полного бухгалтерского учета для строительной компании",
    },
    {
      id: 1235,
      title: "Налоговое консультирование по НДС",
      client: "ИП Сериков А.Б.",
      executor: "Марат Касымов",
      category: "Консультации",
      budget: 15000,
      status: "completed",
      priority: "normal",
      createdDate: "2024-01-12",
      deadline: "2024-01-20",
      completedDate: "2024-01-18",
      responses: 8,
      flags: 0,
      description: "Консультация по вопросам НДС для индивидуального предпринимателя",
    },
    {
      id: 1236,
      title: "Восстановление учета за 2023 год",
      client: "ТОО 'Казахстан Логистик'",
      executor: null,
      category: "Восстановление учета",
      budget: 85000,
      status: "open",
      priority: "high",
      createdDate: "2024-01-18",
      deadline: "2024-03-01",
      responses: 15,
      flags: 2,
      description: "Необходимо восстановить бухгалтерский учет за весь 2023 год",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">Открыт</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">В работе</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Завершен</Badge>
      case "disputed":
        return <Badge className="bg-red-100 text-red-800">Спор</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Отменен</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const getFilteredOrders = () => {
    let filtered = orders

    if (activeTab !== "all") {
      if (activeTab === "flagged") {
        filtered = filtered.filter((order) => order.flags > 0)
      } else {
        filtered = filtered.filter((order) => order.status === activeTab)
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id.toString().includes(searchQuery),
      )
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "budget_high":
          return b.budget - a.budget
        case "budget_low":
          return a.budget - b.budget
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "responses":
          return b.responses - a.responses
        case "flags":
          return b.flags - a.flags
        case "newest":
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управление заказами</h1>
              <p className="text-gray-600">Модерируйте заказы и отслеживайте их выполнение</p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Flag className="w-4 h-4 mr-2" />
              Массовые действия
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск заказов..."
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
                      <SelectItem value="budget_high">Бюджет: по убыванию</SelectItem>
                      <SelectItem value="budget_low">Бюджет: по возрастанию</SelectItem>
                      <SelectItem value="deadline">По дедлайну</SelectItem>
                      <SelectItem value="responses">По откликам</SelectItem>
                      <SelectItem value="flags">По жалобам</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Фильтры
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">Все ({orders.length})</TabsTrigger>
                  <TabsTrigger value="open">Открытые ({orders.filter((o) => o.status === "open").length})</TabsTrigger>
                  <TabsTrigger value="in_progress">
                    В работе ({orders.filter((o) => o.status === "in_progress").length})
                  </TabsTrigger>
                  <TabsTrigger value="disputed">
                    Споры ({orders.filter((o) => o.status === "disputed").length})
                  </TabsTrigger>
                  <TabsTrigger value="flagged">С жалобами ({orders.filter((o) => o.flags > 0).length})</TabsTrigger>
                  <TabsTrigger value="completed">
                    Завершенные ({orders.filter((o) => o.status === "completed").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4 mt-6">
                  {getFilteredOrders().map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                #{order.id} - {order.title}
                              </h3>
                              {getStatusBadge(order.status)}
                              {order.flags > 0 && (
                                <Badge className="bg-red-100 text-red-800">
                                  <Flag className="w-3 h-3 mr-1" />
                                  {order.flags} жалоб
                                </Badge>
                              )}
                            </div>

                            <p className="text-gray-600 mb-3">{order.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <p className="text-gray-500">Заказчик:</p>
                                <p className="font-medium">{order.client}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Исполнитель:</p>
                                <p className="font-medium">{order.executor || "Не назначен"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Категория:</p>
                                <p className="font-medium">{order.category}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Бюджет:</p>
                                <p className="font-bold text-green-600">{order.budget.toLocaleString()} ₸</p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button size="sm" variant="outline">
                                Просмотреть
                              </Button>
                              <Button size="sm" variant="outline">
                                Редактировать
                              </Button>
                              {order.flags > 0 && (
                                <Button size="sm" variant="outline" className="text-red-600">
                                  <Flag className="w-4 h-4 mr-1" />
                                  Рассмотреть жалобы
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
