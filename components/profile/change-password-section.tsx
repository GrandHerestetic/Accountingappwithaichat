"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField, fieldAriaProps, fieldInputClass } from "@/components/form-field"
import {
  clearFieldError,
  type FieldErrors,
  validatePassword,
  validatePasswordConfirm,
} from "@/lib/form-errors"
import { changePassword } from "@/lib/api"
import { ApiError } from "@/lib/api/types"
import { toast } from "sonner"
import { KeyRound, Eye, EyeOff } from "lucide-react"

type PasswordField = "current" | "new" | "confirm"

function mapPasswordError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "wrong_password") {
      return "Неверный текущий пароль"
    }
    if (error.code === "same_password") {
      return "Новый пароль должен отличаться от текущего"
    }
    if (error.code === "invalid_password") {
      return "Пароль должен быть не менее 8 символов"
    }
    return error.message
  }
  return error instanceof Error ? error.message : "Не удалось сменить пароль"
}

export function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors<PasswordField>>({})
  const [saving, setSaving] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const updateField = (field: PasswordField, value: string) => {
    if (field === "current") setCurrentPassword(value)
    if (field === "new") setNewPassword(value)
    if (field === "confirm") setConfirmPassword(value)
    setErrors((prev) => clearFieldError(prev, field))
  }

  const handleSubmit = async () => {
    const nextErrors: FieldErrors<PasswordField> = {
      current: validatePassword(currentPassword),
      new: validatePassword(newPassword),
      confirm: validatePasswordConfirm(newPassword, confirmPassword),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSaving(true)
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setErrors({})
      toast.success("Пароль успешно изменён")
    } catch (e) {
      const message = mapPasswordError(e)
      if (e instanceof ApiError && e.code === "wrong_password") {
        setErrors((prev) => ({ ...prev, current: message }))
      }
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const renderPasswordInput = (
    id: string,
    label: string,
    value: string,
    field: PasswordField,
    show: boolean,
    onToggleShow: () => void,
  ) => (
    <FormField label={label} htmlFor={id} error={errors[field]} required>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={field === "current" ? "current-password" : "new-password"}
          value={value}
          onChange={(e) => updateField(field, e.target.value)}
          className={fieldInputClass(errors[field], "pr-10")}
          {...fieldAriaProps(errors[field], id)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={onToggleShow}
          aria-label={show ? "Скрыть пароль" : "Показать пароль"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FormField>
  )

  return (
    <div className="space-y-4 pt-4 border-t">
      <h4 className="font-medium text-lg flex items-center gap-2">
        <KeyRound className="w-4 h-4" />
        Смена пароля
      </h4>
      <div className="space-y-4">
        {renderPasswordInput(
          "pwd-current",
          "Текущий пароль",
          currentPassword,
          "current",
          showCurrent,
          () => setShowCurrent((v) => !v),
        )}
        {renderPasswordInput(
          "pwd-new",
          "Новый пароль",
          newPassword,
          "new",
          showNew,
          () => setShowNew((v) => !v),
        )}
        {renderPasswordInput(
          "pwd-confirm",
          "Подтверждение пароля",
          confirmPassword,
          "confirm",
          showConfirm,
          () => setShowConfirm((v) => !v),
        )}
      </div>
      <Button type="button" variant="outline" disabled={saving} onClick={() => void handleSubmit()}>
        {saving ? "Сохранение..." : "Обновить пароль"}
      </Button>
    </div>
  )
}
