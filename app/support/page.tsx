"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, MessageCircle, Phone, Mail, Clock, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  const faqItems = [
    {
      question: "Как зарегистрироваться на платформе?",
      answer:
        "Нажмите кнопку 'Регистрация', выберите тип аккаунта (заказчик или исполнитель), заполните форму и пройдите верификацию документов.",
    },
    {
      question: "Возвращаются ли деньги за отклик?",
      answer:
        "Нет, стоимость отклика не возвращается, даже если вас не выберут. Это мотивирует исполнителей отправлять качественные предложения.",
    },
    {
      question: "Что делать, если рейтинг упал ниже 3 звезд?",
      answer:
        "При снижении рейтинга ниже 3 звезд аккаунт блокируется на 7 дней. Для разблокировки необходимо пройти обучающие курсы.",
    },
    {
      question: "Как связаться с исполнителем?",
      answer:
        "После размещения заказа вы можете общаться с откликнувшимися исполнителями через встроенный чат платформы.",
    },
    {
      question: "Можно ли отменить заказ?",
      answer:
        "Да, заказ можно отменить в любое время. Возврат средств возможен только в первые 24 часа после размещения.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">BuhPro</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Главная
          </Link>
          <Link href="/auth/login">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Войти
            </Button>
          </Link>
        </nav>
      </header>

      <main className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Центр поддержки</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Мы готовы помочь вам с любыми вопросами по использованию платформы BuhPro
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 mb-16">
            {/* Contact Methods */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Телефон</CardTitle>
                <CardDescription>Звоните нам в рабочее время</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900 mb-2">+7 (727) 123-45-67</p>
                <p className="text-sm text-gray-600">Пн-Пт: 9:00 - 18:00</p>
                <p className="text-sm text-gray-600">Сб-Вс: 10:00 - 16:00</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Email</CardTitle>
                <CardDescription>Напишите нам письмо</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900 mb-2">support@buhpro.kz</p>
                <p className="text-sm text-gray-600">Ответим в течение 24 часов</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Онлайн-чат</CardTitle>
                <CardDescription>Быстрая помощь в реальном времени</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Начать чат</Button>
                <p className="text-sm text-gray-600 mt-2">Доступен 24/7</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Отправить сообщение</CardTitle>
                <CardDescription>Заполните форму, и мы свяжемся с вами в ближайшее время</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input id="name" placeholder="Ваше имя" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Тема обращения</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тему" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Техническая проблема</SelectItem>
                      <SelectItem value="billing">Вопрос по тарифам</SelectItem>
                      <SelectItem value="account">Проблемы с аккаунтом</SelectItem>
                      <SelectItem value="verification">Верификация документов</SelectItem>
                      <SelectItem value="rating">Вопросы по рейтингу</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Сообщение</Label>
                  <Textarea id="message" placeholder="Опишите вашу проблему или вопрос подробно..." rows={6} />
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">Отправить сообщение</Button>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Часто задаваемые вопросы</CardTitle>
                <CardDescription>Возможно, ответ на ваш вопрос уже есть здесь</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                    <p className="text-sm text-gray-600">{item.answer}</p>
                  </div>
                ))}

                <div className="pt-4">
                  <Link href="/faq">
                    <Button variant="outline" className="w-full">
                      Посмотреть все вопросы
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Working Hours */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Время работы поддержки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h4 className="font-medium text-gray-900">Телефонная поддержка</h4>
                  <p className="text-sm text-gray-600">Пн-Пт: 9:00 - 18:00</p>
                  <p className="text-sm text-gray-600">Сб-Вс: 10:00 - 16:00</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Email поддержка</h4>
                  <p className="text-sm text-gray-600">24/7</p>
                  <p className="text-sm text-gray-600">Ответ в течение 24 часов</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Онлайн-чат</h4>
                  <p className="text-sm text-gray-600">24/7</p>
                  <p className="text-sm text-gray-600">Мгновенные ответы</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Экстренные случаи</h4>
                  <p className="text-sm text-gray-600">24/7</p>
                  <p className="text-sm text-gray-600">Критические проблемы</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
