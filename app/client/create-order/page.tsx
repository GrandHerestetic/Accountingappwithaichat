"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, DollarSign, TrendingUp, Pin, Palette, CreditCard } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { apiRequest } from "@/lib/api-client"
import type { CreateOrderRequest, Order } from "@/lib/api/types"
import { toast } from "sonner"

export default function CreateOrder() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { label: "Ведение бухгалтерского учета", slug: "accounting" },
    { label: "Налоговое консультирование", slug: "tax-consulting" },
    { label: "Аудиторские услуги", slug: "audit" },
    { label: "Финансовый анализ", slug: "financial-analysis" },
    { label: "Подготовка отчетности", slug: "reporting" },
    { label: "Восстановление учета", slug: "accounting-recovery" },
    { label: "Консультации по налогам", slug: "tax-advice" },
    { label: "Другое", slug: "other" },
  ]

  const regions = [
    "Алматы",
    "Нур-Султан",
    "Шымкент",
    "Караганда",
    "Актобе",
    "Тараз",
    "Павлодар",
    "Усть-Каменогорск",
    "Семей",
    "Атырау",
    "Костанай",
    "Кызылорда",
    "Уральск",
    "Петропавловск",
    "Онлайн (удаленно)",
  ]

  const promotionOptions = [
    {
      id: "top",
      name: "Поднятие в ТОП",
      description: "Ваш заказ будет показан первым в течение 3 дней",
      price: 1000,
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      id: "highlight",
      name: "Выделение цветом",
      description: "Заказ будет выделен цветом для привлечения внимания",
      price: 500,
      icon: Palette,
      color: "text-purple-600",
    },
    {
      id: "pin",
      name: "Закрепление",
      description: "Заказ будет закреплен в верхней части списка",
      price: 1500,
      icon: Pin,
      color: "text-blue-600",
    },
  ]

  const togglePromotion = (promotionId: string) => {
    setSelectedPromotions((prev) =>
      prev.includes(promotionId) ? prev.filter((id) => id !== promotionId) : [...prev, promotionId],
    )
  }

  const calculateTotal = () => {
    const basePrice = 2500
    const promotionPrice = selectedPromotions.reduce((total, promoId) => {
      const promo = promotionOptions.find((p) => p.id === promoId)
      return total + (promo?.price || 0)
    }, 0)
    return basePrice + promotionPrice
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Введите название заказа")
      return
    }
    if (!description.trim()) {
      toast.error("Введите описание заказа")
      return
    }
    if (!selectedCategory) {
      toast.error("Выберите категорию")
      return
    }
    const budgetNum = parseFloat(budget)
    if (!budget || isNaN(budgetNum) || budgetNum < 0.01 || budgetNum > 999999999.99) {
      toast.error("Укажите корректный бюджет (от 0.01 до 999 999 999.99)")
      return
    }

    const categorySlug = categories.find((c) => c.label === selectedCategory)?.slug ?? selectedCategory

    const payload: CreateOrderRequest = {
      title: title.trim(),
      description: description.trim(),
      category_slug: categorySlug,
      budget_amount: budgetNum,
    }

    setIsSubmitting(true)
    try {
      const order = await apiRequest<Order>("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      // After creating the draft order, submit it for payment
      const submitResult = await apiRequest<{ checkout_url?: string }>(`/api/v1/orders/my/${order.id}/submit`, {
        method: "POST",
      })

      if (submitResult?.checkout_url) {
        window.open(submitResult.checkout_url, "_blank")
      } else {
        toast.success("Заказ успешно создан!")
      }

      router.push("/client/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Не удалось создать заказ"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />

        <main className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Создание заказа</h1>
              <p className="text-gray-600">Заполните информацию о вашем заказе для поиска исполнителя</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Основная информация</CardTitle>
                    <CardDescription>Опишите ваш заказ максимально подробно</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Название заказа</Label>
                      <Input
                        id="title"
                        placeholder="Например: Ведение бухгалтерского учета для ТОО"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Категория</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию услуг" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.slug} value={category.label}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Описание заказа</Label>
                      <Textarea
                        id="description"
                        placeholder="Подробно опишите что нужно сделать, какие требования к исполнителю, особые условия..."
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Бюджет (тенге)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="budget"
                            placeholder="50000"
                            className="pl-10"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-gray-500">Укажите примерный бюджет в тенге</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deadline">Срок выполнения</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="deadline"
                            type="date"
                            className="pl-10"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Регион</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Выберите регион или укажите 'Онлайн'" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Promotion Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Дополнительные опции продвижения</CardTitle>
                    <CardDescription>Увеличьте видимость вашего заказа</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {promotionOptions.map((option) => {
                      const Icon = option.icon
                      const isSelected = selectedPromotions.includes(option.id)

                      return (
                        <div
                          key={option.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => togglePromotion(option.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <Icon className={`w-6 h-6 ${option.color} mt-1`} />
                              <div>
                                <h3 className="font-medium">{option.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={isSelected ? "default" : "secondary"}>{option.price} ₸</Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Итого к оплате
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Размещение заказа</span>
                        <span className="font-medium">2500 ₸</span>
                      </div>

                      {selectedPromotions.map((promoId) => {
                        const promo = promotionOptions.find((p) => p.id === promoId)
                        if (!promo) return null

                        return (
                          <div key={promoId} className="flex justify-between text-sm">
                            <span className="text-gray-600">{promo.name}</span>
                            <span className="font-medium">{promo.price} ₸</span>
                          </div>
                        )
                      })}

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Общая сумма</span>
                        <span className="text-blue-600">{calculateTotal()} ₸</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <div className="text-sm text-gray-600">
                        <h4 className="font-medium mb-2">Что вы получите:</h4>
                        <ul className="space-y-1">
                          <li>• Публикация заказа на 30 дней</li>
                          <li>• Неограниченное количество откликов</li>
                          <li>• Чат с исполнителями</li>
                          <li>• Просмотр профилей и рейтингов</li>
                          {selectedPromotions.includes("top") && <li>• Размещение в ТОП на 3 дня</li>}
                          {selectedPromotions.includes("highlight") && <li>• Цветное выделение</li>}
                          {selectedPromotions.includes("pin") && <li>• Закрепление заказа</li>}
                        </ul>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Создание..." : "Перейти к оплате"}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Нажимая кнопку, вы соглашаетесь с условиями размещения заказа
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
