"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, MapPin, Award, CheckCircle, MessageCircle, Phone, Mail, Globe, Edit, Save, X, Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { apiRequest } from "@/lib/api-client"
import type { Review, PaginatedResponse } from "@/lib/api/types"

export default function ProfilePage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    name: "Марат Абдуллаев",
    title: "Сертифицированный бухгалтер",
    location: "Алматы, Казахстан",
    bio: "Опытный бухгалтер с 8-летним стажем работы в области налогового учета и консультирования. Специализируюсь на ведении учета для малого и среднего бизнеса, восстановлении документооборота и налоговом планировании.",
    email: "marat.abdullaev@email.com",
    phone: "+7 (777) 123-45-67",
    website: "https://marat-accounting.kz",
  })

  const profile = {
    name: "Марат Абдуллаев",
    title: "Сертифицированный бухгалтер",
    location: "Алматы, Казахстан",
    rating: 4.8,
    reviewsCount: 45,
    completedOrders: 89,
    memberSince: "2022-03-15",
    verified: true,
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Опытный бухгалтер с 8-летним стажем работы в области налогового учета и консультирования. Специализируюсь на ведении учета для малого и среднего бизнеса, восстановлении документооборота и налоговом планировании.",
    specializations: [
      "Бухгалтерский учет",
      "Налоговое консультирование",
      "Восстановление учета",
      "Финансовый анализ",
      "МСФО",
    ],
    achievements: [
      { title: "Топ исполнитель", description: "Рейтинг выше 4.5", icon: Star },
      { title: "Надежный партнер", description: "50+ успешных заказов", icon: CheckCircle },
      { title: "Быстрый отклик", description: "Ответ в течение часа", icon: MessageCircle },
    ],
    contact: {
      email: "marat.abdullaev@email.com",
      phone: "+7 (777) 123-45-67",
      website: "https://marat-accounting.kz",
    },
  }

  const reviews = [
    {
      id: 1,
      client: "ТОО 'Алматы Строй'",
      rating: 5,
      comment: "Отличная работа! Марат помог восстановить весь учет за 2023 год. Все сделано качественно и в срок.",
      date: "2024-01-20",
      project: "Восстановление бухгалтерского учета",
    },
    {
      id: 2,
      client: "ИП Сериков А.Б.",
      rating: 5,
      comment: "Профессиональный подход к налоговому планированию. Рекомендую!",
      date: "2024-01-15",
      project: "Налоговое консультирование",
    },
    {
      id: 3,
      client: "ТОО 'Казахстан Логистик'",
      rating: 4,
      comment: "Хорошая работа по ведению учета. Есть небольшие замечания, но в целом доволен.",
      date: "2024-01-10",
      project: "Ведение бухгалтерского учета",
    },
  ]

  const handleSaveProfile = () => {
    // В реальном приложении здесь будет API вызов для сохранения данных
    console.log("Saving profile:", editedProfile)
    alert("Профиль успешно обновлен!")
    setIsEditDialogOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-2xl">МА</AvatarFallback>
                      </Avatar>
                      {profile.verified && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                    <p className="text-gray-600 mb-3">{profile.title}</p>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-bold">{profile.rating}</span>
                      <span className="text-gray-600">({profile.reviewsCount} отзывов)</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Завершено заказов:</span>
                      <span className="font-medium">{profile.completedOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">На платформе с:</span>
                      <span className="font-medium">
                        {new Date(profile.memberSince).toLocaleDateString("ru-RU", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать профиль
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Редактирование профиля</DialogTitle>
                          <DialogDescription>
                            Обновите информацию о себе, чтобы привлечь больше клиентов
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Основная информация */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-lg">Основная информация</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Имя и фамилия</Label>
                                <Input
                                  id="edit-name"
                                  value={editedProfile.name}
                                  onChange={(e) => handleInputChange("name", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-title">Специализация</Label>
                                <Input
                                  id="edit-title"
                                  value={editedProfile.title}
                                  onChange={(e) => handleInputChange("title", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-location">Местоположение</Label>
                              <Input
                                id="edit-location"
                                value={editedProfile.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-bio">О себе</Label>
                              <Textarea
                                id="edit-bio"
                                rows={4}
                                value={editedProfile.bio}
                                onChange={(e) => handleInputChange("bio", e.target.value)}
                                placeholder="Расскажите о своем опыте и специализации..."
                              />
                            </div>
                          </div>

                          {/* Контактная информация */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-lg">Контактная информация</h4>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={editedProfile.email}
                                  onChange={(e) => handleInputChange("email", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-phone">Телефон</Label>
                                <Input
                                  id="edit-phone"
                                  value={editedProfile.phone}
                                  onChange={(e) => handleInputChange("phone", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-website">Веб-сайт</Label>
                                <Input
                                  id="edit-website"
                                  value={editedProfile.website}
                                  onChange={(e) => handleInputChange("website", e.target.value)}
                                  placeholder="https://your-website.com"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Кнопки действий */}
                          <div className="flex gap-3 pt-4 border-t">
                            <Button onClick={handleSaveProfile} className="flex-1">
                              <Save className="w-4 h-4 mr-2" />
                              Сохранить изменения
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              <X className="w-4 h-4 mr-2" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a href={profile.contact.website} className="text-sm text-blue-600 hover:underline">
                      {profile.contact.website}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="about">О себе</TabsTrigger>
                  <TabsTrigger value="reviews">Отзывы</TabsTrigger>
                  <TabsTrigger value="portfolio">Портфолио</TabsTrigger>
                  <TabsTrigger value="achievements">Достижения</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Описание</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Специализации</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Отзывы клиентов</CardTitle>
                      <CardDescription>
                        {profile.reviewsCount} отзывов со средней оценкой {profile.rating}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{review.client}</h4>
                              <p className="text-sm text-gray-600">{review.project}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString("ru-RU")}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="portfolio" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Портфолио</CardTitle>
                      <CardDescription>Примеры выполненных работ</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Портфолио пока пусто</h3>
                        <p className="text-gray-600 mb-6">
                          Добавьте примеры своих работ, чтобы привлечь больше клиентов
                        </p>
                        <Button>Добавить работу</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Достижения</CardTitle>
                      <CardDescription>Ваши награды и достижения на платформе</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {profile.achievements.map((achievement, index) => {
                          const Icon = achievement.icon
                          return (
                            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                              <div className="p-3 bg-blue-100 rounded-full">
                                <Icon className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{achievement.title}</h4>
                                <p className="text-sm text-gray-600">{achievement.description}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
