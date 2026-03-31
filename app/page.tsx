"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import {
  Search,
  Users,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Calculator,
  FileText,
  PieChart,
  Briefcase,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const features = [
    {
      icon: Users,
      title: "Проверенные специалисты",
      description: "Все исполнители проходят верификацию и имеют подтвержденную квалификацию",
    },
    {
      icon: Shield,
      title: "Безопасные сделки",
      description: "Система эскроу защищает ваши средства до завершения работы",
    },
    {
      icon: Clock,
      title: "Быстрое выполнение",
      description: "Средний срок выполнения заказов составляет 2-3 рабочих дня",
    },
    {
      icon: Star,
      title: "Гарантия качества",
      description: "Система рейтингов и отзывов обеспечивает высокое качество услуг",
    },
  ]

  const services = [
    {
      icon: Calculator,
      title: "Ведение учета",
      description: "Полное ведение бухгалтерского учета для ИП и ООО",
      price: "от 15,000 ₸/мес",
      popular: true,
    },
    {
      icon: FileText,
      title: "Подготовка отчетности",
      description: "Составление и подача налоговых деклараций и отчетов",
      price: "от 8,000 ₸",
      popular: false,
    },
    {
      icon: PieChart,
      title: "Налоговое планирование",
      description: "Оптимизация налогообложения и консультации",
      price: "от 12,000 ₸",
      popular: false,
    },
    {
      icon: Briefcase,
      title: "Регистрация бизнеса",
      description: "Помощь в регистрации ИП и ООО, получении лицензий",
      price: "от 25,000 ₸",
      popular: false,
    },
  ]

  const stats = [
    { label: "Активных исполнителей", value: "2,500+" },
    { label: "Выполненных заказов", value: "15,000+" },
    { label: "Довольных клиентов", value: "8,500+" },
    { label: "Средний рейтинг", value: "4.8/5" },
  ]

  const testimonials = [
    {
      name: "Анна Петрова",
      role: "ИП",
      content:
        "Отличная платформа! Нашла надежного бухгалтера за один день. Все документы оформлены качественно и в срок.",
      rating: 5,
    },
    {
      name: "Максим Иванов",
      role: "Директор ООО",
      content: "Пользуюсь BuhPro уже год. Очень удобно находить специалистов для разовых задач. Рекомендую!",
      rating: 5,
    },
    {
      name: "Елена Сидорова",
      role: "Предприниматель",
      content: "Система эскроу дает уверенность в безопасности сделок. Качество услуг всегда на высоте.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Найдите лучших{" "}
              <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                бухгалтеров
              </span>{" "}
              для вашего бизнеса
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Платформа для поиска квалифицированных бухгалтеров и финансовых консультантов. Безопасно, быстро и
              надежно.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Найти бухгалтера или услугу..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Найти
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/client/create-order">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Разместить заказ
                </Button>
              </Link>
              <Link href="/executor/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 px-8 bg-transparent"
                >
                  <span className="text-blue-600">Принять заказ</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">Популярные услуги</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Найдите нужную услугу среди самых востребованных предложений наших специалистов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <Card
                  key={index}
                  className={`relative hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                    service.popular ? "ring-2 ring-blue-500 shadow-lg" : ""
                  }`}
                >
                  {service.popular && (
                    <Badge className="absolute -top-2 left-4 bg-blue-600 text-white">Популярное</Badge>
                  )}
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="text-sm">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-blue-600">{service.price}</span>
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                        Подробнее
                        <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">Почему выбирают BuhPro</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Мы создали платформу, которая обеспечивает максимальную безопасность и удобство для всех участников
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">Отзывы клиентов</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Узнайте, что говорят о нас предприниматели и владельцы бизнеса
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Готовы начать?</h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам предпринимателей, которые уже нашли своих идеальных бухгалтеров
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/client/register">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 px-8">
                Зарегистрироваться как клиент
              </Button>
            </Link>
            <Link href="/executor/register">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 px-8 bg-transparent"
              >
                Стать исполнителем
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BP</span>
                </div>
                <span className="font-bold text-xl">BuhPro</span>
              </div>
              <p className="text-gray-400 mb-4">
                Платформа для поиска квалифицированных бухгалтеров и финансовых консультантов.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-2">
                  <MessageCircle className="w-5 h-5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-2">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-2">
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Для клиентов</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/orders" className="hover:text-white transition-colors">
                    Найти исполнителя
                  </Link>
                </li>
                <li>
                  <Link href="/client/create-order" className="hover:text-white transition-colors">
                    Разместить заказ
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-white transition-colors">
                    Обучение
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white transition-colors">
                    Поддержка
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Для исполнителей</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/executor/register" className="hover:text-white transition-colors">
                    Стать исполнителем
                  </Link>
                </li>
                <li>
                  <Link href="/executor/orders" className="hover:text-white transition-colors">
                    Найти заказы
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-white transition-colors">
                    Повышение квалификации
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Тарифы
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Компания</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    О нас
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-white transition-colors">
                    Возможности
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Конфиденциальность
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Условия использования
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BuhPro. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
