"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, CheckCircle, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CoachRegister() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      experience: "",
      specialization: "",
    },
    professional: {
      education: "",
      achievements: "",
      methodology: "",
      description: "",
    },
    agreeTerms: false,
  })
  const { register } = useAuth()
  const router = useRouter()

  const handleNext = () => {
    if (step < 2) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleComplete = async () => {
    if (!formData.agreeTerms) {
      toast.error("Необходимо согласиться с условиями использования")
      return
    }
    if (!formData.personalInfo.email.trim()) {
      toast.error("Укажите email")
      return
    }
    if (!password || password.length < 8) {
      toast.error("Пароль должен быть не менее 8 символов")
      return
    }

    setIsLoading(true)

    try {
      const aboutParts = [
        formData.professional.description,
        formData.professional.education,
        formData.professional.achievements,
        formData.professional.methodology,
      ].filter(Boolean)
      await register({
        email: formData.personalInfo.email.trim(),
        password,
        role: "coach",
        profile_name: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim() || "Новый коуч",
        phone: formData.personalInfo.phone || undefined,
        first_name: formData.personalInfo.firstName || undefined,
        last_name: formData.personalInfo.lastName || undefined,
        specializations: formData.personalInfo.specialization
          ? [formData.personalInfo.specialization]
          : undefined,
        education: formData.professional.education || undefined,
        about: aboutParts.join("\n\n") || undefined,
      })

      // Перенаправление в личный кабинет
      router.push("/coach/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка регистрации. Попробуйте еще раз.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 2 && <div className={`w-16 h-1 mx-2 ${step > stepNum ? "bg-purple-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-xs mx-auto">
            <span>Личные данные</span>
            <span>Профессиональная информация</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Регистрация коуча
            </CardTitle>
            <CardDescription>
              {step === 1 && "Заполните личную информацию"}
              {step === 2 && "Укажите профессиональные навыки и опыт"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя *</Label>
                    <Input
                      id="firstName"
                      placeholder="Анна"
                      value={formData.personalInfo.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, firstName: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия *</Label>
                    <Input
                      id="lastName"
                      placeholder="Петрова"
                      value={formData.personalInfo.lastName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, lastName: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="anna@example.kz"
                      value={formData.personalInfo.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, email: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      placeholder="+7 (777) 123-45-67"
                      value={formData.personalInfo.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, phone: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Опыт коучинга *</Label>
                    <Select
                      value={formData.personalInfo.experience}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, experience: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите опыт" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 года</SelectItem>
                        <SelectItem value="3-5">3-5 лет</SelectItem>
                        <SelectItem value="6-10">6-10 лет</SelectItem>
                        <SelectItem value="10+">Более 10 лет</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Специализация *</Label>
                    <Select
                      value={formData.personalInfo.specialization}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, specialization: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите специализацию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Бизнес-коучинг</SelectItem>
                        <SelectItem value="career">Карьерный коучинг</SelectItem>
                        <SelectItem value="finance">Финансовый коучинг</SelectItem>
                        <SelectItem value="leadership">Лидерство</SelectItem>
                        <SelectItem value="personal">Личностный рост</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="education">Образование и сертификаты *</Label>
                  <Textarea
                    id="education"
                    placeholder="Укажите ваше образование, коучинговые сертификаты, курсы..."
                    rows={3}
                    value={formData.professional.education}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        professional: { ...formData.professional, education: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievements">Достижения и опыт</Label>
                  <Textarea
                    id="achievements"
                    placeholder="Расскажите о ваших достижениях, успешных кейсах, клиентах..."
                    rows={3}
                    value={formData.professional.achievements}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        professional: { ...formData.professional, achievements: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="methodology">Методология работы</Label>
                  <Textarea
                    id="methodology"
                    placeholder="Опишите ваш подход к коучингу, используемые методики..."
                    rows={3}
                    value={formData.professional.methodology}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        professional: { ...formData.professional, methodology: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">О себе *</Label>
                  <Textarea
                    id="description"
                    placeholder="Расскажите о себе, своей философии коучинга, целевой аудитории..."
                    rows={5}
                    value={formData.professional.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        professional: { ...formData.professional, description: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Минимум 8 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Информация для коучей:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Создавайте и продавайте обучающие курсы</li>
                    <li>• Проводите индивидуальные и групповые сессии</li>
                    <li>• Получайте доступ к аналитике и отчетам</li>
                    <li>• Взаимодействуйте с сообществом профессионалов</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: !!checked })}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Я согласен с{" "}
                    <a href="/terms" className="text-purple-600 hover:underline">
                      условиями использования
                    </a>{" "}
                    и{" "}
                    <a href="/privacy" className="text-purple-600 hover:underline">
                      политикой конфиденциальности
                    </a>
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  Назад
                </Button>
              )}
              <div className="ml-auto">
                {step < 2 ? (
                  <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    Далее
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleComplete} className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    {isLoading ? "Регистрация..." : "Завершить регистрацию"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
