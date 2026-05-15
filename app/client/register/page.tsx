"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Building, FileText, User, ArrowRight, Upload, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { FileUploadField } from "@/components/file-upload-field"
import { getMe, uploadAndAttach } from "@/lib/api"
import { toast } from "sonner"

export default function ClientRegister() {
  const [clientType, setClientType] = useState("")
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [verificationDoc, setVerificationDoc] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    clientType: "",
    companyName: "",
    bin: "",
    contactPerson: "",
    position: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    documents: [],
    agreeTerms: false,
  })
  const { register } = useAuth()
  const router = useRouter()

  const clientTypes = [
    { value: "too", label: "ТОО (Юридическое лицо)", icon: Building },
    { value: "ip", label: "ИП (Индивидуальный предприниматель)", icon: User },
    { value: "representative", label: "Доверенный представитель", icon: FileText },
  ]

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
    if (!formData.email) {
      toast.error("Укажите email")
      return
    }
    if (!password || password.length < 8) {
      toast.error("Пароль должен быть не менее 8 символов")
      return
    }
    if (!verificationDoc) {
      toast.error("Загрузите документ для верификации")
      return
    }

    setIsLoading(true)

    try {
      await register({
        email: formData.email,
        password,
        role: "client",
        profile_name: formData.contactPerson || formData.companyName || "Новый клиент",
      })

      const me = await getMe()
      await uploadAndAttach([verificationDoc], "profile_document", me.id)

      toast.success("Регистрация завершена")
      router.push("/client/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка регистрации")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 3 && <div className={`w-16 h-1 mx-2 ${step > stepNum ? "bg-blue-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Тип клиента</span>
            <span>Данные компании</span>
            <span>Верификация</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Регистрация заказчика</CardTitle>
            <CardDescription>
              {step === 1 && "Выберите тип вашей организации"}
              {step === 2 && "Заполните данные компании"}
              {step === 3 && "Загрузите документы для верификации"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Client Type Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <Label className="text-base font-medium">Тип клиента</Label>
                <div className="grid gap-4">
                  {clientTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <div
                        key={type.value}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          clientType === type.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setClientType(type.value)
                          setFormData({ ...formData, clientType: type.value })
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="font-medium">{type.label}</h3>
                            <p className="text-sm text-gray-600">
                              {type.value === "too" && "Для юридических лиц и компаний"}
                              {type.value === "ip" && "Для индивидуальных предпринимателей"}
                              {type.value === "representative" && "Для представителей компаний"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Company Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{clientType === "ip" ? "ФИО ИП" : "Название компании"}</Label>
                    <Input
                      id="companyName"
                      placeholder={clientType === "ip" ? "Иванов Иван Иванович" : 'ТОО "Название компании"'}
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bin">БИН/ИИН</Label>
                    <Input
                      id="bin"
                      placeholder="123456789012"
                      value={formData.bin}
                      onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Контактное лицо</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Иванов Иван"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Должность</Label>
                    <Input
                      id="position"
                      placeholder="Директор"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      placeholder="+7 (777) 123-45-67"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@company.kz"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    placeholder="г. Алматы, ул. Абая 123"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание деятельности</Label>
                  <Textarea
                    id="description"
                    placeholder="Краткое описание вашей деятельности..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              </div>
            )}

            {/* Step 3: Document Upload */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Загрузите документы</h3>
                  <p className="text-gray-600 mb-4">Для верификации необходимо загрузить следующие документы:</p>
                </div>

                <FileUploadField
                  label={
                    clientType === "too"
                      ? "Документы регистрации"
                      : clientType === "ip"
                        ? "Справка о регистрации ИП"
                        : "Доверенность"
                  }
                  hint="PDF, JPG, PNG до 5MB"
                  value={verificationDoc}
                  onChange={setVerificationDoc}
                  required
                  disabled={isLoading}
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: !!checked })}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Я согласен с{" "}
                    <a href="/terms" className="text-blue-600 hover:underline">
                      условиями использования
                    </a>{" "}
                    и{" "}
                    <a href="/privacy" className="text-blue-600 hover:underline">
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
                  <Button
                    onClick={handleNext}
                    disabled={(step === 1 && !clientType) || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
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
