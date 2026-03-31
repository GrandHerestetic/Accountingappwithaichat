"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Shield, Eye, Lock, FileText } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
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
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Политика конфиденциальности</h1>
            <p className="text-gray-600">Последнее обновление: 20 января 2024 года</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Общие положения
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Настоящая Политика конфиденциальности определяет порядок обработки и защиты информации о пользователях
                  платформы BuhPro (далее — «Платформа»).
                </p>
                <p>
                  Мы серьезно относимся к защите ваших персональных данных и обязуемся обеспечивать их безопасность в
                  соответствии с требованиями законодательства Республики Казахстан.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Какую информацию мы собираем
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h4>Персональные данные:</h4>
                <ul>
                  <li>ФИО, контактные данные (телефон, email)</li>
                  <li>БИН/ИИН организации или ИП</li>
                  <li>Адрес регистрации и фактического местонахождения</li>
                  <li>Банковские реквизиты для проведения платежей</li>
                </ul>

                <h4>Техническая информация:</h4>
                <ul>
                  <li>IP-адрес, данные браузера и устройства</li>
                  <li>Информация о действиях на платформе</li>
                  <li>Файлы cookie и аналогичные технологии</li>
                </ul>

                <h4>Деловая информация:</h4>
                <ul>
                  <li>Информация о заказах и услугах</li>
                  <li>Переписка между пользователями</li>
                  <li>Отзывы и рейтинги</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Как мы используем информацию
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>Мы используем собранную информацию для:</p>
                <ul>
                  <li>Предоставления услуг платформы</li>
                  <li>Верификации пользователей</li>
                  <li>Обработки платежей</li>
                  <li>Обеспечения безопасности</li>
                  <li>Улучшения качества сервиса</li>
                  <li>Отправки уведомлений и важной информации</li>
                  <li>Соблюдения требований законодательства</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Защита данных</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>Мы применяем следующие меры защиты:</p>
                <ul>
                  <li>Шифрование данных при передаче и хранении</li>
                  <li>Ограниченный доступ к персональным данным</li>
                  <li>Регулярное обновление систем безопасности</li>
                  <li>Мониторинг несанкционированного доступа</li>
                  <li>Резервное копирование данных</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Передача данных третьим лицам</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>Мы можем передавать ваши данные:</p>
                <ul>
                  <li>Платежным системам для обработки транзакций</li>
                  <li>Государственным органам по их законному требованию</li>
                  <li>Нашим партнерам для предоставления услуг (с вашего согласия)</li>
                </ul>
                <p>Мы не продаем и не передаем персональные данные третьим лицам в коммерческих целях.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ваши права</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>Вы имеете право:</p>
                <ul>
                  <li>Получать информацию об обработке ваших данных</li>
                  <li>Требовать исправления неточных данных</li>
                  <li>Требовать удаления ваших данных</li>
                  <li>Ограничить обработку данных</li>
                  <li>Отозвать согласие на обработку</li>
                  <li>Подать жалобу в уполномоченный орган</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>По вопросам обработки персональных данных обращайтесь:</p>
                <ul>
                  <li>Email: privacy@buhpro.kz</li>
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
