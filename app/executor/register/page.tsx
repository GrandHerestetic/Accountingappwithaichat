"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UserCheck, FileText, Award, Upload, CheckCircle, ArrowRight, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { submitExecutorLead } from "@/lib/api"
import { FileUploadField } from "@/components/file-upload-field"

export default function ExecutorRegister() {
  const [step, setStep] = useState(1)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [documents, setDocuments] = useState({
    identity: null as File | null,
    education: null as File | null,
    ipRegistration: null as File | null,
  })
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      middleName: "",
      iin: "",
      phone: "",
      email: "",
      city: "",
      experience: "",
    },
    professional: {
      specializations: [],
      education: "",
      workFormat: "",
      hourlyRate: "",
      description: "",
    },
    documents: [],
    agreeTerms: false,
  })
  const router = useRouter()

  const specializations = [
    "Бухгалтерский учет",
    "Налоговое консультирование",
    "Аудиторские услуги",
    "Финансовый анализ",
    "Подготовка отчетности",
    "Восстановление учета",
    "Управленческий учет",
    "Международные стандарты (МСФО)",
    "Налоговое планирование",
    "Кадровое делопроизводство",
  ]

  const cities = [
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
    "Удаленно",
  ]

  const handleSpecializationToggle = (specialization: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(specialization) ? prev.filter((s) => s !== specialization) : [...prev, specialization],
    )
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleComplete = async () => {
    if (!formData.agreeTerms) {
      toast.error("Необходимо согласиться с условиями использования")
      return
    }
    if (selectedSpecializations.length === 0) {
      toast.error("Выберите хотя бы одну специализацию")
      return
    }
    if (!documents.identity || !documents.education) {
      toast.error("Загрузите удостоверение личности и документ об образовании")
      return
    }
    if (!password || password.length < 8) {
      toast.error("Пароль должен быть не менее 8 символов")
      return
    }

    setIsLoading(true)
    try {
      const fd = new FormData()
      const p = formData.personalInfo
      const pro = formData.professional

      fd.append("email", p.email)
      fd.append("password", password)
      fd.append("first_name", p.firstName)
      fd.append("last_name", p.lastName)
      if (p.middleName) fd.append("middle_name", p.middleName)
      fd.append("iin", p.iin)
      fd.append("phone", p.phone)
      fd.append("city", p.city)
      fd.append("experience_level", p.experience)
      fd.append("education", pro.education)
      fd.append("about", pro.description)
      fd.append("work_format", pro.workFormat)
      if (pro.hourlyRate) fd.append("hourly_rate", pro.hourlyRate)
      fd.append("terms_accepted", "true")
      for (const spec of selectedSpecializations) {
        fd.append("specializations", spec)
      }
      fd.append("identity_document", documents.identity)
      fd.append("education_document", documents.education)
      if (documents.ipRegistration) {
        fd.append("ip_registration_document", documents.ipRegistration)
      }

      const result = await submitExecutorLead(fd)
      toast.success(result.message || "Заявка отправлена на модерацию")
      router.push("/auth/login")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка регистрации")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 3 && <div className={`w-16 h-1 mx-2 ${step > stepNum ? "bg-green-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Личные данные</span>
            <span>Профессиональная информация</span>
            <span>Документы</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-green-600" />
              Регистрация исполнителя
            </CardTitle>
            <CardDescription>
              {step === 1 && "Заполните личную информацию"}
              {step === 2 && "Укажите профессиональные навыки и опыт"}
              {step === 3 && "Загрузите документы для верификации"}
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
                      placeholder="Иван"
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
                      placeholder="Иванов"
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

                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input
                    id="middleName"
                    placeholder="Иванович"
                    value={formData.personalInfo.middleName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, middleName: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="iin">ИИН *</Label>
                    <Input
                      id="iin"
                      placeholder="123456789012"
                      value={formData.personalInfo.iin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, iin: e.target.value },
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

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ivan@example.kz"
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
                  <Label htmlFor="password">Пароль *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Минимум 8 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Город *</Label>
                    <Select
                      value={formData.personalInfo.city}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, city: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите город" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Опыт работы *</Label>
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
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Специализации *</Label>
                  <p className="text-sm text-gray-600">Выберите области, в которых вы работаете</p>
                  <div className="grid grid-cols-2 gap-3">
                    {specializations.map((spec) => (
                      <div
                        key={spec}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all text-sm ${
                          selectedSpecializations.includes(spec)
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleSpecializationToggle(spec)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{spec}</span>
                          {selectedSpecializations.includes(spec) && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedSpecializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedSpecializations.map((spec) => (
                        <Badge key={spec} variant="secondary" className="bg-green-100 text-green-800">
                          {spec}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleSpecializationToggle(spec)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Образование *</Label>
                  <Textarea
                    id="education"
                    placeholder="Укажите ваше образование, сертификаты, курсы повышения квалификации..."
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workFormat">Формат работы *</Label>
                    <Select
                      value={formData.professional.workFormat}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          professional: { ...formData.professional, workFormat: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите формат" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Удаленно</SelectItem>
                        <SelectItem value="office">В офисе клиента</SelectItem>
                        <SelectItem value="mixed">Смешанный формат</SelectItem>
                        <SelectItem value="flexible">Гибкий график</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Почасовая ставка (₸)</Label>
                    <Input
                      id="hourlyRate"
                      placeholder="3000"
                      value={formData.professional.hourlyRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          professional: { ...formData.professional, hourlyRate: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">О себе *</Label>
                  <Textarea
                    id="description"
                    placeholder="Расскажите о своем опыте, достижениях, подходе к работе..."
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
              </div>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Загрузите документы</h3>
                  <p className="text-gray-600 mb-4">
                    Для верификации профиля необходимо загрузить следующие документы:
                  </p>
                </div>

                <div className="space-y-4">
                  <FileUploadField
                    label="Удостоверение личности"
                    hint="Скан паспорта или ID карты (PDF, JPG, PNG до 5MB)"
                    value={documents.identity}
                    onChange={(f) => setDocuments((d) => ({ ...d, identity: f }))}
                    required
                    disabled={isLoading}
                  />
                  <FileUploadField
                    label="Документы об образовании"
                    hint="Дипломы, сертификаты, лицензии"
                    value={documents.education}
                    onChange={(f) => setDocuments((d) => ({ ...d, education: f }))}
                    required
                    disabled={isLoading}
                  />
                  <FileUploadField
                    label="Справка о регистрации ИП (если есть)"
                    hint="Для индивидуальных предпринимателей"
                    value={documents.ipRegistration}
                    onChange={(f) => setDocuments((d) => ({ ...d, ipRegistration: f }))}
                    disabled={isLoading}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Важная информация:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Все документы проверяются в течение 24-48 часов</li>
                    <li>• Без верификации нельзя откликаться на заказы</li>
                    <li>• Поддерживаемые форматы: PDF, JPG, PNG (до 5MB)</li>
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
                    <a href="/terms" className="text-green-600 hover:underline">
                      условиями использования
                    </a>{" "}
                    и{" "}
                    <a href="/privacy" className="text-green-600 hover:underline">
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
                {step < 3 ? (
                  <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    Далее
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
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
