"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Heart, Lightbulb, Globe } from "lucide-react"
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
