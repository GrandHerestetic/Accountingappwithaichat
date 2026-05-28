"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Briefcase, ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react"
import { FormField, fieldAriaProps, fieldInputClass } from "@/components/form-field"
import {
  validatePassword,
  validatePasswordConfirm,
  type FieldErrors,
} from "@/lib/form-errors"
import { resetPasswordWithToken } from "@/lib/api"
import { ApiError } from "@/lib/api/types"
import { toast } from "sonner"

type ResetField = "password" | "confirm"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")?.trim() ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState<FieldErrors<ResetField>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async () => {
    const nextErrors: FieldErrors<ResetField> = {
      password: validatePassword(password),
      confirm: validatePasswordConfirm(password, confirm),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    if (!token) {
      toast.error("Ссылка недействительна. Запросите восстановление пароля заново.")
      return
    }

    setLoading(true)
    try {
      await resetPasswordWithToken({ token, new_password: password })
      toast.success("Пароль обновлён. Теперь можно войти.")
      router.push("/auth/login")
    } catch (e) {
      const message =
        e instanceof ApiError && e.code === "invalid_reset_token"
          ? "Ссылка устарела или уже использована. Запросите новую."
          : e instanceof Error
            ? e.message
            : "Не удалось сменить пароль"
      toast.error(message)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Новый пароль</h1>
          <p className="text-gray-600">Придумайте новый пароль для входа</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Сброс пароля
            </CardTitle>
            <CardDescription>Минимум 8 символов</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!token && (
              <p className="text-sm text-red-600">
                В ссылке нет токена. Перейдите на{" "}
                <Link href="/auth/forgot-password" className="underline">
                  восстановление пароля
                </Link>{" "}
                и запросите новую ссылку.
              </p>
            )}

            <FormField label="Новый пароль" htmlFor="reset-password" error={errors.password} required>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  className={fieldInputClass(errors.password, "pr-10")}
                  {...fieldAriaProps(errors.password, "reset-password")}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <FormField
              label="Подтверждение пароля"
              htmlFor="reset-confirm"
              error={errors.confirm}
              required
            >
              <div className="relative">
                <Input
                  id="reset-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value)
                    setErrors((prev) => ({ ...prev, confirm: undefined }))
                  }}
                  className={fieldInputClass(errors.confirm, "pr-10")}
                  {...fieldAriaProps(errors.confirm, "reset-confirm")}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || !token}
              onClick={() => void handleSubmit()}
            >
              {loading ? "Сохранение..." : "Сохранить пароль"}
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ко входу
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          Загрузка…
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
