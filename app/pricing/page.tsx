"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Базовый",
      price: "Бесплатно",
      description: "Для начинающих пользователей",
      icon: Star,
      color: "bg-gray-100 text-gray-600",
      features: [
        "До 3 активных заказов",
        "Базовая поддержка",
        "Стандартные фильтры поиска",
        "Основные уведомления",
        "Профиль исполнителя",
      ],
      limitations: ["Комиссия 10% с заказов", "Ограниченная статистика"],
      buttonText: "Начать бесплатно",
      buttonVariant: "outline" as const,
    },
    {
      name: "Профессиональный",
      price: "990 ₽/мес",
      description: "Для активных пользователей",
      icon: Zap,
      color: "bg-blue-100 text-blue-600",
      popular: true,
      features: [
        "Неограниченные заказы",
        "Приоритетная поддержка",
        "Расширенные фильтры",
        "Push-уведомления",
        "Детальная аналитика",
        "Продвижение профиля",
        "Быстрые выплаты",
      ],
      limitations: ["Комиссия 5% с заказов"],
      buttonText: "Выбрать план",
      buttonVariant: "default" as const,
    },
    {
      name: "Бизнес",
      price: "2990 ₽/мес",
      description: "Для компаний и агентств",
      icon: Crown,
      color: "bg-purple-100 text-purple-600",
      features: [
        "Все возможности Профессионального",
        "Персональный менеджер",
        "API доступ",
        "Белый лейбл",
        "Корпоративная отчетность",
        "Массовые операции",
        "Интеграции с CRM",
        "Приоритет в поиске",
      ],
      limitations: ["Комиссия 3% с заказов"],
      buttonText: "Связаться с нами",
      buttonVariant: "outline" as const,
    },
  ]

  const faq = [
    {
      question: "Можно ли изменить тарифный план?",
      answer:
        "Да, вы можете изменить тарифный план в любое время в настройках аккаунта. Условия перехода уточняйте у поддержки.",
    },
    {
      question: "Есть ли скидки для долгосрочных подписок?",
      answer:
        "Для корпоративных клиентов возможны индивидуальные условия. Напишите в поддержку с темой «Тарифы».",
    },
    {
      question: "Что происходит при отмене подписки?",
      answer:
        "При отмене подписки ваш аккаунт переходит на базовый план в конце текущего периода. Все данные сохраняются.",
    },
    {
      question: "Включена ли поддержка во все планы?",
      answer:
        "Да, поддержка включена во все планы. Базовый план включает поддержку по email, платные планы - приоритетную поддержку.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">Тарифные планы</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Выберите подходящий план
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Гибкие тарифы для любых потребностей. Начните бесплатно и масштабируйтесь по мере роста
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <Card key={index} className={`relative ${plan.popular ? "ring-2 ring-blue-500 shadow-lg" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                    Популярный
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 rounded-lg ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <div key={limitationIndex} className="flex items-center text-gray-500">
                        <div className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" variant={plan.buttonVariant} size="lg">
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Часто задаваемые вопросы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faq.map((item, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-gray-600 text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Остались вопросы?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Наша команда поддержки готова помочь вам выбрать подходящий тарифный план
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Связаться с поддержкой
              </Button>
            </Link>
            <Link href="/client/register">
              <Button size="lg" variant="outline">
                Начать бесплатно
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
