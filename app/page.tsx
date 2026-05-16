"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { listCourses, listOrders } from "@/lib/api"
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
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [platformStats, setPlatformStats] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    Promise.all([
      listOrders({ page: 1, pageSize: 1 }),
      listCourses({ page: 1, pageSize: 1 }),
    ])
      .then(([orders, courses]) => {
        setPlatformStats([
          { label: "Заказов на платформе", value: String(orders.total) },
          { label: "Курсов в каталоге", value: String(courses.total) },
        ])
      })
      .catch(() => setPlatformStats([]))
  }, [])

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
      popular: true,
    },
    {
      icon: FileText,
      title: "Подготовка отчетности",
      description: "Составление и подача налоговых деклараций и отчетов",
      popular: false,
    },
    {
      icon: PieChart,
      title: "Налоговое планирование",
      description: "Оптимизация налогообложения и консультации",
      popular: false,
    },
    {
      icon: Briefcase,
      title: "Регистрация бизнеса",
      description: "Помощь в регистрации ИП и ООО, получении лицензий",
      popular: false,
    },
  ]

  const handleSearch = () => {
    const q = searchQuery.trim()
    router.push(q ? `/orders?q=${encodeURIComponent(q)}` : "/orders")
  }

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
                <Button
                  size="lg"
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  onClick={handleSearch}
                >
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

      {platformStats.length > 0 && (
        <section className="py-12 md:py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-6 md:gap-8 max-w-lg mx-auto">
              {platformStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
                <Link key={index} href="/orders">
                <Card
                  className={`relative hover:shadow-lg transition-all duration-300 cursor-pointer group h-full ${
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
                    <span className="text-sm text-blue-600 font-medium">Смотреть заказы →</span>
                  </CardContent>
                </Card>
                </Link>
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
              <Link href="/support" className="text-gray-400 hover:text-white text-sm">
                Связаться с поддержкой
              </Link>
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
