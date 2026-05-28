export type FieldErrors<T extends string = string> = Partial<Record<T, string>>

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean)
}

export function clearFieldError<T extends string>(
  errors: FieldErrors<T>,
  field: T,
): FieldErrors<T> {
  if (!errors[field]) return errors
  const next = { ...errors }
  delete next[field]
  return next
}

export function validateRequired(value: string, message = "Обязательное поле"): string | undefined {
  return value.trim() ? undefined : message
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return "Укажите email"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Некорректный формат email"
  return undefined
}

export function validatePassword(value: string, min = 8): string | undefined {
  if (!value) return "Укажите пароль"
  if (value.length < min) return `Пароль должен быть не менее ${min} символов`
  return undefined
}

export function validatePasswordConfirm(
  password: string,
  confirm: string,
): string | undefined {
  if (!confirm) return "Подтвердите пароль"
  if (password !== confirm) return "Пароли не совпадают"
  return undefined
}

export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, "")
  if (!value.trim()) return undefined
  if (digits.length < 10 || digits.length > 15) return "Некорректный номер телефона"
  return undefined
}

export function validateUrl(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    if (!url.hostname) return "Некорректный URL"
    return undefined
  } catch {
    return "Некорректный URL"
  }
}

export function validateBudget(value: string): string | undefined {
  const num = parseFloat(value)
  if (!value.trim()) return "Укажите бюджет"
  if (Number.isNaN(num) || num < 0.01 || num > 999_999_999.99) {
    return "Бюджет от 0.01 до 999 999 999.99"
  }
  return undefined
}

export function validateMinLength(
  value: string,
  min: number,
  message?: string,
): string | undefined {
  if (value.trim().length < min) {
    return message ?? `Минимум ${min} символов`
  }
  return undefined
}
