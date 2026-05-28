"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Clock, Home, LogIn } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")?.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Заявка отправлена</CardTitle>
          <CardDescription>
            Регистрация исполнителя принята и ожидает проверки администратором
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-amber-200 bg-amber-50">
            <Clock className="h-4 w-4 text-amber-700" />
            <AlertTitle className="text-amber-900">Вход пока недоступен</AlertTitle>
            <AlertDescription className="text-amber-800">
              Аккаунт создаётся только после одобрения заявки. Сейчас войти с указанным email и
              паролем нельзя — это не ошибка пароля, а ожидание модерации (обычно 24–48 часов).
              {email ? (
                <>
                  {" "}
                  Заявка отправлена на <strong>{email}</strong>.
                </>
              ) : null}
            </AlertDescription>
          </Alert>

          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>Мы проверим документы и данные профиля</li>
            <li>После одобрения вы сможете войти на странице авторизации</li>
            <li>До одобрения откликаться на заказы нельзя</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                На главную
              </Link>
            </Button>
            <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
              <Link href="/auth/login?executor_pending=1">
                <LogIn className="w-4 h-4 mr-2" />
                Страница входа
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ExecutorRegisterSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          Загрузка…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
