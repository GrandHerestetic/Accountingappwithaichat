"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Briefcase, ArrowLeft, Mail } from "lucide-react"
import { FormField, fieldAriaProps, fieldInputClass } from "@/components/form-field"
import { validateEmail } from "@/lib/form-errors"
import { requestPasswordReset } from "@/lib/api"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const [mailConfigured, setMailConfigured] = useState<boolean | null>(null)

  const handleSubmit = async () => {
    const err = validateEmail(email)
    setEmailError(err)
    if (err) return

    setLoading(true)
    setDevResetUrl(null)
    try {
      const resp = await requestPasswordReset(email)
      setSubmitted(true)
      if (resp.reset_url) {
        setDevResetUrl(resp.reset_url)
      }
      toast.success(resp.message)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось отправить запрос")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Briefcase className="h-10 w-10 text-blue-600" />
            <span className="ml-2 text-3xl font-bold text-gray-900">BuhPro</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Восстановление пароля</h1>
          <p className="text-gray-600">Укажите email, с которым вы регистрировались</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Забыли пароль?
            </CardTitle>
            <CardDescription>
              Мы отправим инструкцию, если аккаунт с таким email зарегистрирован
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitted ? (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <AlertTitle className="text-green-900">Запрос принят</AlertTitle>
                  <AlertDescription className="text-green-800">
                    Если аккаунт существует, на {email} должна прийти инструкция. Проверьте папку
                    «Спам».
                  </AlertDescription>
                </Alert>
                {devResetUrl && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTitle className="text-amber-900">Режим разработки</AlertTitle>
                    <AlertDescription className="text-amber-800 space-y-2">
                      <p>
                        {mailConfigured === false
                          ? "SMTP не настроен в .env бэкенда (SMTP_HOST и SMTP_FROM). Пока письма не отправляются — используйте ссылку:"
                          : "Не удалось отправить письмо (проверьте SMTP_USER/SMTP_PASSWORD и логи API). Ссылка для сброса:"}
                      </p>
                      <Link
                        href={devResetUrl}
                        className="text-blue-600 hover:underline break-all text-sm font-medium"
                      >
                        {devResetUrl}
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <>
                <FormField label="Email" htmlFor="forgot-email" error={emailError} required>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="example@company.kz"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError(undefined)
                    }}
                    className={fieldInputClass(emailError)}
                    {...fieldAriaProps(emailError, "forgot-email")}
                  />
                </FormField>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                  onClick={() => void handleSubmit()}
                >
                  {loading ? "Отправка..." : "Отправить ссылку"}
                </Button>
              </>
            )}

            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться ко входу
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
