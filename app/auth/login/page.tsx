"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Briefcase, BookOpen, Settings } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("client")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (userType: string) => {
    // Простая валидация
    if (!formData.email || !formData.password) {
      toast.error("Пожалуйста, заполните все поля")
      return
    }

    setIsLoading(true)

    try {
      await login({
        email: formData.email,
        password: formData.password,
      })

      // Перенаправление на соответствующий дашборд
      const redirectPath = getDashboardPath(userType)
      router.push(redirectPath)
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка входа. Попробуйте еще раз.")
    } finally {
      setIsLoading(false)
    }
  }

  const getDashboardPath = (type: string) => {
    switch (type) {
      case "client":
        return "/client/dashboard"
      case "executor":
        return "/executor/dashboard"
      case "coach":
        return "/coach/dashboard"
      case "admin":
        return "/admin/dashboard"
      default:
        return "/"
    }
  }

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case "client":
        return "Заказчик"
      case "executor":
        return "Исполнитель"
      case "coach":
        return "Коуч"
      case "admin":
        return "Администратор"
      default:
        return "Пользователь"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать!</h1>
          <p className="text-gray-600">Войдите в свой аккаунт для продолжения</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>Выберите тип аккаунта и войдите</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="client">Заказчик</TabsTrigger>
                <TabsTrigger value="executor">Исполнитель</TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email или БИН/ИИН</Label>
                    <Input
                      id="client-email"
                      type="text"
                      placeholder="example@company.kz или 123456789012"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-password">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="client-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Введите пароль"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-client"
                      checked={formData.remember}
                      onCheckedChange={(checked) => setFormData({ ...formData, remember: !!checked })}
                    />
                    <Label htmlFor="remember-client" className="text-sm">
                      Запомнить меня
                    </Label>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleLogin("client")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Вход..." : "Войти как заказчик"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="executor" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="executor-email">Email или ИИН</Label>
                    <Input
                      id="executor-email"
                      type="text"
                      placeholder="example@email.kz или 123456789012"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="executor-password">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="executor-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Введите пароль"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-executor"
                      checked={formData.remember}
                      onCheckedChange={(checked) => setFormData({ ...formData, remember: !!checked })}
                    />
                    <Label htmlFor="remember-executor" className="text-sm">
                      Запомнить меня
                    </Label>
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleLogin("executor")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Вход..." : "Войти как исполнитель"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Или войти как</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleLogin("coach")}
                  disabled={isLoading}
                >
                  <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                  Коуч
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleLogin("admin")}
                  disabled={isLoading}
                >
                  <Settings className="w-4 h-4 mr-2 text-orange-600" />
                  Админ
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center space-y-2">
              {/* <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                Забыли пароль?
              </Link> */}
              <div className="text-sm text-gray-600">
                Нет аккаунта?{" "}
                <Link href="/client/register" className="text-blue-600 hover:underline">
                  Зарегистрироваться как заказчик
                </Link>{" "}
                или{" "}
                <Link href="/executor/register" className="text-blue-600 hover:underline">
                  как исполнитель
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Входя в систему, вы соглашаетесь с{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              условиями использования
            </Link>{" "}
            и{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              политикой конфиденциальности
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
