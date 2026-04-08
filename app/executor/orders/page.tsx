"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  MessageCircle,
  TrendingUp,
  Eye,
  Phone,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function ExecutorOrders() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const orders = [
    {
      id: 1,
      title: "Ведение бухгалтерского учета для ТОО на постоянной основе",
      client: "ТОО 'Алматы Строй'",
      budget: "50000 ₸",
      deadline: "2024-03-15",
      location: "Алматы",
      category: "Бухгалтерский учет",
      description:
        "Требуется ведение полного бухгалтерского учета для строительной компании. Опыт работы с НДС обязателен...",
      responses: 15,
      views: 89,
      postedAt: "2024-01-20T10:00:00",
      isPromoted: true,
      promotionType: "top",
      responsePrice: 1000,
      contactPrice: 800,
    },
    {
      id: 2,
      title: "Восстановление бухгалтерского учета за 2023 год",
      client: "ИП Сериков А.Б.",
      budget: "75000 ₸",
      deadline: "2024-02-28",
      location: "Удаленно",
      category: "Восстановление учета",
      description: "Необходимо восстановить бухгалтерский учет за весь 2023 год. Документы частично утеряны...",
      responses: 8,
      views: 45,
      postedAt: "2024-01-19T14:30:00",
      isPromoted: false,
      responsePrice: 800,
      contactPrice: 600,
    },
    {
      id: 3,
      title: "Налоговое консультирование по оптимизации",
      client: "ТОО 'Казахстан Логистик'",
      budget: "30000 ₸",
      deadline: "2024-02-25",
      location: "Нур-Султан",
      category: "Налоговое консультирование",
      description: "Требуется консультация по оптимизации налогообложения для логистической компании...",
      responses: 12,
      views: 67,
      postedAt: "2024-01-18T09:15:00",
      isPromoted: true,
      promotionType: "highlight",
      responsePrice: 700,
      contactPrice: 500,
    },
    {
      id: 4,
      title: "Подготовка финансовой отчетности по МСФО",
      client: "ТОО 'Энергия Плюс'",
      budget: "120000 ₸",
      deadline: "2024-03-10",
      location: "Алматы",
      category: "Финансовый анализ",
      description: "Подготовка годовой финансовой отчетности по международным стандартам...",
      responses: 6,
      views: 34,
      postedAt: "2024-01-17T16:45:00",
      isPromoted: false,
      responsePrice: 1200,
      contactPrice: 1000,
    },
  ]

  const categories = [
    "Все категории",
    "Бухгалтерский учет",
    "Налоговое консультирование",
    "Аудиторские услуги",
    "Финансовый анализ",
    "Восстановление учета",
    "Подготовка отчетности",
  ]

  const locations = ["Все города", "Алматы", "Нур-Султан", "Шымкент", "Караганда", "Удаленно"]

  const getPromotionBadge = (order: any) => {
    if (!order.isPromoted) return null

    if (order.promotionType === "top") {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          ТОП
        </Badge>
      )
    }

    if (order.promotionType === "highlight") {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Выделено</Badge>
    }

    return null
  }

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.client.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        !selectedCategory || selectedCategory === "Все категории" || order.category === selectedCategory
      const matchesLocation =
        !selectedLocation || selectedLocation === "Все города" || order.location === selectedLocation

      return matchesSearch && matchesCategory && matchesLocation
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "budget_high":
          return Number.parseInt(b.budget.replace(/\D/g, "")) - Number.parseInt(a.budget.replace(/\D/g, ""))
        case "budget_low":
          return Number.parseInt(a.budget.replace(/\D/g, "")) - Number.parseInt(b.budget.replace(/\D/g, ""))
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "responses":
          return b.responses - a.responses
        case "newest":
        default:
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      }
    })

  const handleResponseClick = (orderId: number) => {
    // Перенаправляем на страницу отклика
    window.location.href = `/executor/orders/${orderId}/response`
  }

  const handleContactClick = () => {
    alert("Контакты получены! С вашего баланса списано 800 ₸")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <Navigation userType="executor" userName="Марат Абдуллаев" notifications={7} />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Поиск заказов</h1>
              <p className="text-gray-600">Найдите подходящие проекты и откликнитесь на них</p>
            </div>
            <Link href="/executor/dashboard">
              <Button variant="outline">Вернуться в кабинет</Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Фильтры поиска
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по заказам..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Город" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button className="bg-green-600 hover:bg-green-700">
                  <Search className="w-4 h-4 mr-2" />
                  Найти
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Найдено {filteredOrders.length} заказов</p>
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
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={`${order.isPromoted ? "border-2 border-orange-200 bg-orange-50/30" : ""} hover:shadow-lg transition-shadow`}
              >
                {order.isPromoted && order.promotionType === "top" && (
                  <div className="bg-orange-600 text-white px-4 py-2 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Продвигаемый заказ - показан первым
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{order.title}</h3>
                        {getPromotionBadge(order)}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <span className="font-medium">Заказчик: {order.client}</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {order.budget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          До {new Date(order.deadline).toLocaleDateString("ru-RU")}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {order.location}
                        </span>
                      </div>

                      <Badge variant="outline" className="mb-3">
                        {order.category}
                      </Badge>

                      <p className="text-gray-700 mb-4 leading-relaxed">{order.description}</p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {order.responses} откликов
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {order.views} просмотров
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(order.postedAt).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    </div>

                    <div className="ml-6 space-y-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Стоимость отклика:</p>
                        <p className="text-lg font-bold text-green-600">{order.responsePrice} ₸</p>
                      </div>

                      <div className="space-y-2">
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleResponseClick(order.id)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Откликнуться ({order.responsePrice} ₸)
                        </Button>

                        <Button variant="outline" className="w-full" onClick={handleContactClick}>
                          <Phone className="w-4 h-4 mr-2" />
                          Позвонить ({order.contactPrice} ₸)
                        </Button>

                        <Button variant="ghost" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Заказы не найдены</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры поиска или проверьте позже</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("")
                    setSelectedLocation("")
                  }}
                >
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="mt-8 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-green-900 mb-3">💡 Советы для успешных откликов:</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Внимательно читайте описание заказа и требования</li>
                <li>• Указывайте конкретные сроки и стоимость в своем предложении</li>
                <li>• Прикрепляйте примеры своих работ или сертификаты</li>
                <li>• Отвечайте быстро - заказчики ценят оперативность</li>
                <li>• Поддерживайте высокий рейтинг для большего доверия</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
