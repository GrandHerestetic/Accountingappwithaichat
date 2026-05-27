"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Users,
  Clock,
  Star,
  MessageCircle,
  CreditCard,
  FileText,
  Search,
  CheckCircle,
  Zap,
  Globe,
  Award,
} from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      icon: Shield,
      title: "Прозрачные сделки",
      description: "Статусы заказов, отклики и переписка в одном месте — без лишних шагов",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Users,
      title: "Проверенные специалисты",
      description: "Все исполнители проходят верификацию и имеют рейтинг",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Clock,
      title: "Быстрый поиск",
      description: "Найдите исполнителя за несколько минут с помощью умных фильтров",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Star,
      title: "Система рейтингов",
      description: "Честные отзывы и рейтинги помогают выбрать лучших",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: MessageCircle,
      title: "Встроенный чат",
      description: "Общайтесь с исполнителями прямо на платформе",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: CreditCard,
      title: "Быстрая публикация",
      description: "Заказы и отклики публикуются сразу, без лишних шагов",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: FileText,
      title: "Управление проектами",
      description: "Отслеживайте прогресс и управляйте задачами",
      color: "bg-teal-100 text-teal-600",
    },
    {
      icon: Search,
      title: "Умный поиск",
      description: "Находите нужные услуги по ключевым словам и категориям",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: CheckCircle,
      title: "Гарантия качества",
      description: "Рейтинги, отзывы и модерация помогают выбрать надёжного исполнителя",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: Zap,
      title: "Быстрые уведомления",
      description: "Мгновенные уведомления о новых сообщениях и заказах",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Globe,
      title: "Работа удаленно",
      description: "Сотрудничайте с исполнителями из любой точки мира",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      icon: Award,
      title: "Программа лояльности",
      description: "Получайте бонусы за активность на платформе",
      color: "bg-violet-100 text-violet-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">Возможности платформы</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Все что нужно для успешной работы
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            BuhPro предоставляет полный набор инструментов для эффективного сотрудничества между заказчиками и
            исполнителями
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам пользователей, которые уже используют BuhPro для успешного ведения бизнеса
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/client/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Стать заказчиком
              </Button>
            </Link>
            <Link href="/executor/register">
              <Button size="lg" variant="outline">
                Стать исполнителем
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
