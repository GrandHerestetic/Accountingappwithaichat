"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Target, Users, Award, Heart, Lightbulb, Shield, Globe, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Наша миссия",
      description: "Создать надежную экосистему для эффективного сотрудничества между заказчиками и исполнителями",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Heart,
      title: "Наши ценности",
      description: "Честность, качество, инновации и забота о каждом пользователе нашей платформы",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Lightbulb,
      title: "Наше видение",
      description: "Стать ведущей платформой для фриланса и аутсорсинга в России и СНГ",
      color: "bg-yellow-100 text-yellow-600",
    },
  ]

  const stats = [
    { number: "2019", label: "Год основания" },
    { number: "5000+", label: "Активных пользователей" },
    { number: "1200+", label: "Выполненных проектов" },
    { number: "50+", label: "Городов присутствия" },
  ]

  const team = [
    {
      name: "Алексей Петров",
      role: "CEO & Основатель",
      description: "15+ лет опыта в IT и управлении проектами",
      avatar: "/placeholder.svg?height=100&width=100&text=АП",
    },
    {
      name: "Мария Сидорова",
      role: "CTO",
      description: "Эксперт в области разработки и архитектуры систем",
      avatar: "/placeholder.svg?height=100&width=100&text=МС",
    },
    {
      name: "Дмитрий Козлов",
      role: "Head of Product",
      description: "Специалист по пользовательскому опыту и продуктовой стратегии",
      avatar: "/placeholder.svg?height=100&width=100&text=ДК",
    },
    {
      name: "Анна Волкова",
      role: "Head of Marketing",
      description: "Эксперт в области цифрового маркетинга и развития бренда",
      avatar: "/placeholder.svg?height=100&width=100&text=АВ",
    },
  ]

  const achievements = [
    {
      icon: Award,
      title: "Лучшая платформа фриланса 2023",
      description: "По версии Russian Freelance Awards",
    },
    {
      icon: Shield,
      title: "Сертификат безопасности",
      description: "ISO 27001 для защиты данных пользователей",
    },
    {
      icon: Users,
      title: "Топ-3 по популярности",
      description: "Среди платформ фриланса в России",
    },
    {
      icon: TrendingUp,
      title: "Рост 300% в год",
      description: "Количество активных пользователей",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">О компании</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Мы создаем будущее фриланса
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            BuhPro — это современная платформа, которая объединяет талантливых исполнителей с амбициозными заказчиками
            для создания выдающихся проектов
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div
                    className={`w-16 h-16 rounded-full ${value.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                  <CardDescription className="text-gray-600">{value.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl p-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Наша история</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-6">
                BuhPro была основана в 2019 году группой энтузиастов, которые видели проблемы в существующих платформах
                фриланса. Мы хотели создать место, где качество работы и честные отношения стоят на первом месте.
              </p>
              <p className="mb-6">
                За годы работы мы выросли от небольшого стартапа до одной из ведущих платформ в России. Наш успех
                основан на доверии пользователей и постоянном стремлении к совершенству.
              </p>
              <p>
                Сегодня BuhPro объединяет тысячи профессионалов и помогает реализовывать проекты любой сложности — от
                простых задач до масштабных корпоративных решений.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Наша команда</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <Badge variant="secondary" className="mb-2">
                    {member.role}
                  </Badge>
                  <CardDescription className="text-sm">{member.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Наши достижения</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <Card key={index}>
                  <CardContent className="flex items-center p-6">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-gray-600 text-sm">{achievement.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <Globe className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Присоединяйтесь к нам</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Станьте частью растущего сообщества профессионалов и найдите свой путь к успеху
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
