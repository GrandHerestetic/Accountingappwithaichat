"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, DollarSign, TrendingUp, Pin, Palette, CreditCard } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { createOrder, submitMyOrder } from "@/lib/api"
import type { CreateOrderRequest, Order } from "@/lib/api/types"
import { ORDER_CATEGORIES } from "@/lib/order-categories"
import { FormField, fieldAriaProps, fieldInputClass } from "@/components/form-field"
import {
  clearFieldError,
  type FieldErrors,
  validateBudget,
  validateMinLength,
  validateRequired,
} from "@/lib/form-errors"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type OrderField = "title" | "description" | "category" | "region" | "deadline" | "budget"

export default function CreateOrder() {
  const router = useRouter()
  const [errors, setErrors] = useState<FieldErrors<OrderField>>({})
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ORDER_CATEGORIES.map((c) => ({ label: c.label, slug: c.slug }))

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
    const categorySlug =
      categories.find((c) => c.label === selectedCategory)?.slug ?? selectedCategory

    const nextErrors: FieldErrors<OrderField> = {
      title: validateMinLength(title, 3, "Название должно содержать минимум 3 символа"),
      description: validateMinLength(description, 10, "Описание должно содержать минимум 10 символов"),
      category: validateRequired(selectedCategory, "Выберите категорию"),
      region: validateRequired(selectedRegion, "Выберите регион"),
      deadline: validateRequired(deadline, "Укажите срок выполнения"),
      budget: validateBudget(budget),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const budgetNum = parseFloat(budget)

    const payload: CreateOrderRequest = {
      title: title.trim(),
      description: description.trim(),
      category_slug: categorySlug,
      budget_amount: budgetNum,
      currency: "KZT",
      region: selectedRegion,
      deadline_at: deadline,
      promotions: selectedPromotions as CreateOrderRequest["promotions"],
    }

    setIsSubmitting(true)
    try {
      const order = await createOrder(payload)

      const submitResult = await submitMyOrder(order.id)

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

  const clearError = (field: OrderField) => {
    setErrors((prev) => clearFieldError(prev, field))
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
                    <FormField label="Название заказа" htmlFor="title" error={errors.title} required>
                      <Input
                        id="title"
                        placeholder="Например: Ведение бухгалтерского учета для ТОО"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value)
                          clearError("title")
                        }}
                        className={fieldInputClass(errors.title)}
                        {...fieldAriaProps(errors.title, "title")}
                      />
                    </FormField>

                    <FormField label="Категория" htmlFor="category" error={errors.category} required>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) => {
                          setSelectedCategory(value)
                          clearError("category")
                        }}
                      >
                        <SelectTrigger
                          id="category"
                          className={fieldInputClass(errors.category)}
                          {...fieldAriaProps(errors.category, "category")}
                        >
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
                    </FormField>

                    <FormField label="Описание заказа" htmlFor="description" error={errors.description} required>
                      <Textarea
                        id="description"
                        placeholder="Подробно опишите что нужно сделать, какие требования к исполнителю, особые условия..."
                        rows={6}
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value)
                          clearError("description")
                        }}
                        className={fieldInputClass(errors.description)}
                        {...fieldAriaProps(errors.description, "description")}
                      />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Бюджет (тенге)"
                        htmlFor="budget"
                        error={errors.budget}
                        hint={errors.budget ? undefined : "Укажите примерный бюджет в тенге"}
                        required
                      >
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="budget"
                            placeholder="50000"
                            className={fieldInputClass(errors.budget, "pl-10")}
                            value={budget}
                            onChange={(e) => {
                              setBudget(e.target.value)
                              clearError("budget")
                            }}
                            {...fieldAriaProps(errors.budget, "budget")}
                          />
                        </div>
                      </FormField>

                      <FormField label="Срок выполнения" htmlFor="deadline" error={errors.deadline} required>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="deadline"
                            type="date"
                            className={fieldInputClass(errors.deadline, "pl-10")}
                            value={deadline}
                            onChange={(e) => {
                              setDeadline(e.target.value)
                              clearError("deadline")
                            }}
                            {...fieldAriaProps(errors.deadline, "deadline")}
                          />
                        </div>
                      </FormField>
                    </div>

                    <FormField label="Регион" htmlFor="region" error={errors.region} required>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                        <Select
                          value={selectedRegion}
                          onValueChange={(value) => {
                            setSelectedRegion(value)
                            clearError("region")
                          }}
                        >
                          <SelectTrigger
                            id="region"
                            className={cn("pl-10", fieldInputClass(errors.region))}
                            {...fieldAriaProps(errors.region, "region")}
                          >
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
                    </FormField>
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
