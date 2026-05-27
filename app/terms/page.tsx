"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, FileText, Users, CreditCard, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Условия использования</h1>
            <p className="text-gray-600">Последнее обновление: 20 января 2024 года</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Общие положения
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Настоящие Условия использования (далее — «Условия») регулируют отношения между пользователями и
                  платформой BuhPro при использовании наших услуг.
                </p>
                <p>Регистрируясь на платформе, вы соглашаетесь с данными Условиями и обязуетесь их соблюдать.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Права и обязанности пользователей
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h4>Заказчики обязуются:</h4>
                <ul>
                  <li>Предоставлять достоверную информацию о заказе</li>
                  <li>Своевременно оплачивать размещение заказов</li>
                  <li>Объективно оценивать работу исполнителей</li>
                  <li>Соблюдать деловую этику в общении</li>
                </ul>

                <h4>Исполнители обязуются:</h4>
                <ul>
                  <li>Предоставлять качественные услуги</li>
                  <li>Соблюдать установленные сроки</li>
                  <li>Поддерживать высокий рейтинг</li>
                  <li>Проходить обучение при снижении рейтинга</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Размещение заказов и откликов
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Публикация заказов и отправка откликов на платформе бесплатны. Расчёты за выполненную
                  работу согласуются напрямую между заказчиком и исполнителем.
                </p>
                <p>
                  Спорные ситуации по качеству работы рассматриваются администрацией в рамках правил
                  платформы и рейтинговой системы.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Рейтинговая система и санкции
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h4>Система оценок:</h4>
                <ul>
                  <li>Оценка от 1 до 5 звезд с обязательным текстовым отзывом</li>
                  <li>Рейтинг рассчитывается по последним 10 заказам</li>
                  <li>Все оценки являются публичными</li>
                </ul>

                <h4>Санкции для исполнителей:</h4>
                <ul>
                  <li>Рейтинг ниже 3★ — блокировка на 7 дней</li>
                  <li>Повторное снижение — блокировка + обязательное обучение</li>
                  <li>Систематические нарушения — постоянная блокировка</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ответственность сторон</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>Платформа BuhPro:</p>
                <ul>
                  <li>Обеспечивает техническое функционирование сервиса</li>
                  <li>Не несет ответственности за качество услуг исполнителей</li>
                  <li>Не является стороной договора между заказчиком и исполнителем</li>
                  <li>Оставляет за собой право модерации контента</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Интеллектуальная собственность</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <ul>
                  <li>Все права на платформу принадлежат BuhPro</li>
                  <li>Пользователи сохраняют права на свой контент</li>
                  <li>Запрещено копирование и использование материалов без разрешения</li>
                  <li>Нарушение авторских прав влечет блокировку аккаунта</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Изменение условий</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Мы оставляем за собой право изменять данные Условия. О существенных изменениях пользователи
                  уведомляются заранее через email или уведомления на платформе.
                </p>
                <p>
                  Продолжение использования платформы после внесения изменений означает согласие с новыми Условиями.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>По вопросам, связанным с Условиями использования:</p>
                <ul>
                  <li>Email: legal@buhpro.kz</li>
                  <li>Телефон: +7 (727) 123-45-67</li>
                  <li>Адрес: г. Алматы, ул. Абая 123, офис 456</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">Вернуться на главную</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
