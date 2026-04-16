"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  Filter,
  Shield,
  Ban,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  MoreVertical,
  UserCheck,
  UserX,
} from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const users = [
    {
      id: 1,
      name: "ТОО 'Алматы Строй'",
      email: "info@almaty-stroy.kz",
      type: "client",
      status: "active",
      verified: true,
      rating: 4.8,
      orders: 12,
      spent: 540000,
      joinDate: "2024-01-15",
      lastActivity: "2024-01-20",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Айгуль Нурланова",
      email: "aigul.nurlanova@email.com",
      type: "executor",
      status: "active",
      verified: true,
      rating: 4.9,
      orders: 45,
      earned: 890000,
      joinDate: "2024-01-10",
      lastActivity: "2024-01-20",
      avatar: "/placeholder.svg?height=40&width=40",
      specializations: ["Налоговый учет", "Отчетность"],
    },
    {
      id: 3,
      name: "Марат Касымов",
      email: "marat.kasymov@email.com",
      type: "coach",
      status: "active",
      verified: true,
      rating: 4.7,
      courses: 8,
      students: 234,
      earned: 450000,
      joinDate: "2024-01-08",
      lastActivity: "2024-01-19",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "ИП Сериков А.Б.",
      email: "serikov.ab@email.com",
      type: "client",
      status: "pending_verification",
      verified: false,
      rating: 0,
      orders: 0,
      spent: 0,
      joinDate: "2024-01-18",
      lastActivity: "2024-01-18",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      name: "Данияр Абдуллаев",
      email: "danijar.abdullaev@email.com",
      type: "executor",
      status: "suspended",
      verified: true,
      rating: 2.8,
      orders: 8,
      earned: 45000,
      joinDate: "2024-01-05",
      lastActivity: "2024-01-15",
      avatar: "/placeholder.svg?height=40&width=40",
      suspensionReason: "Низкий рейтинг и жалобы клиентов",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Активен</Badge>
      case "pending_verification":
        return <Badge className="bg-yellow-100 text-yellow-800">Ожидает верификации</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Заблокирован</Badge>
      case "banned":
        return <Badge className="bg-gray-100 text-gray-800">Забанен</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "client":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Заказчик
          </Badge>
        )
      case "executor":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Исполнитель
          </Badge>
        )
      case "coach":
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            Коуч
          </Badge>
        )
      case "admin":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            Администратор
          </Badge>
        )
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const getFilteredUsers = () => {
    let filtered = users

    // Фильтр по вкладкам
    if (activeTab !== "all") {
      if (activeTab === "pending") {
        filtered = filtered.filter((user) => user.status === "pending_verification")
      } else if (activeTab === "suspended") {
        filtered = filtered.filter((user) => user.status === "suspended" || user.status === "banned")
      } else {
        filtered = filtered.filter((user) => user.type === activeTab)
      }
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter((user) => user.status === "pending_verification")
      } else if (statusFilter === "suspended") {
        filtered = filtered.filter((user) => user.status === "suspended" || user.status === "banned")
      } else {
        filtered = filtered.filter((user) => user.status === statusFilter)
      }
    }

    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Сортировка
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "orders":
          return (b.orders || 0) - (a.orders || 0)
        case "newest":
        default:
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
      }
    })
  }

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    pendingUsers: users.filter((u) => u.status === "pending_verification").length,
    suspendedUsers: users.filter((u) => u.status === "suspended" || u.status === "banned").length,
  }

  const filteredUsers = getFilteredUsers()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управление пользователями</h1>
              <p className="text-gray-600">Модерируйте и управляйте всеми пользователями платформы</p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Shield className="w-4 h-4 mr-2" />
              Массовые действия
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Активные</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ожидают верификации</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.pendingUsers}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Заблокированы</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.suspendedUsers}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск пользователей..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Фильтр по статусу" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="active">Активные</SelectItem>
                      <SelectItem value="pending">Ожидают верификации</SelectItem>
                      <SelectItem value="suspended">Заблокированные</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Сначала новые</SelectItem>
                      <SelectItem value="name">По имени</SelectItem>
                      <SelectItem value="rating">По рейтингу</SelectItem>
                      <SelectItem value="orders">По заказам</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setStatusFilter("all")
                      setSortBy("newest")
                      setActiveTab("all")
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Найдено пользователей: <span className="font-medium">{filteredUsers.length}</span> из {users.length}
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">Все ({users.length})</TabsTrigger>
                  <TabsTrigger value="client">
                    Заказчики ({users.filter((u) => u.type === "client").length})
                  </TabsTrigger>
                  <TabsTrigger value="executor">
                    Исполнители ({users.filter((u) => u.type === "executor").length})
                  </TabsTrigger>
                  <TabsTrigger value="coach">Коучи ({users.filter((u) => u.type === "coach").length})</TabsTrigger>
                  <TabsTrigger value="pending">
                    Ожидают ({users.filter((u) => u.status === "pending_verification").length})
                  </TabsTrigger>
                  <TabsTrigger value="suspended">
                    Заблокированы ({users.filter((u) => u.status === "suspended").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4 mt-6">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">{user.name}</h3>
                                  {getTypeBadge(user.type)}
                                  {getStatusBadge(user.status)}
                                  {user.verified && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Верифицирован
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-600">{user.email}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span>Регистрация: {new Date(user.joinDate).toLocaleDateString("ru-RU")}</span>
                                  <span>
                                    Последняя активность: {new Date(user.lastActivity).toLocaleDateString("ru-RU")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Просмотр
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Редактировать
                                </Button>
                                <Button size="sm" variant="outline">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* User Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                              {user.type === "client" && (
                                <>
                                  <div>
                                    <span className="text-gray-500">Заказов:</span>
                                    <p className="font-medium">{user.orders}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Потрачено:</span>
                                    <p className="font-medium">{user.spent?.toLocaleString()} ₸</p>
                                  </div>
                                </>
                              )}
                              {user.type === "executor" && (
                                <>
                                  <div>
                                    <span className="text-gray-500">Заказов:</span>
                                    <p className="font-medium">{user.orders}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Заработано:</span>
                                    <p className="font-medium">{user.earned?.toLocaleString()} ₸</p>
                                  </div>
                                </>
                              )}
                              {user.type === "coach" && (
                                <>
                                  <div>
                                    <span className="text-gray-500">Курсов:</span>
                                    <p className="font-medium">{user.courses}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Студентов:</span>
                                    <p className="font-medium">{user.students}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Заработано:</span>
                                    <p className="font-medium">{user.earned?.toLocaleString()} ₸</p>
                                  </div>
                                </>
                              )}
                              <div>
                                <span className="text-gray-500">Рейтинг:</span>
                                <p className="font-medium">{user.rating || "—"}</p>
                              </div>
                            </div>

                            {/* Specializations for executors */}
                            {user.type === "executor" && user.specializations && (
                              <div className="mb-4">
                                <span className="text-sm text-gray-500">Специализации:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.specializations.map((spec, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suspension reason */}
                            {user.status === "suspended" && user.suspensionReason && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">
                                  <strong>Причина блокировки:</strong> {user.suspensionReason}
                                </p>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-2 mt-4">
                              {user.status === "pending_verification" && (
                                <>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Верифицировать
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                    <UserX className="w-4 h-4 mr-1" />
                                    Отклонить
                                  </Button>
                                </>
                              )}
                              {user.status === "active" && (
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <Ban className="w-4 h-4 mr-1" />
                                  Заблокировать
                                </Button>
                              )}
                              {user.status === "suspended" && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Разблокировать
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
                      <p className="text-gray-600">Попробуйте изменить параметры поиска или фильтры</p>
                    </div>
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
