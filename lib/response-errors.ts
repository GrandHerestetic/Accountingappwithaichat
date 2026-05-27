import { ApiError } from "@/lib/api/types"

export function responseActionErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) {
    return err instanceof Error ? err.message : fallback
  }

  if (err.status === 401) {
    return "Сессия истекла. Войдите как исполнитель и попробуйте снова."
  }

  if (err.status === 403) {
    if (err.code === "forbidden" || err.message.toLowerCase().includes("role")) {
      return "Откликаться могут только исполнители. Выйдите и войдите под аккаунтом исполнителя."
    }
    return err.message || "Отклик временно недоступен (ограничение рейтинга или верификации)."
  }

  if (err.status === 409) {
    if (err.code === "already_exists") {
      return "У вас уже есть отклик на этот заказ. Откройте «Мои отклики» для редактирования."
    }
    return "Нельзя отправить отклик в текущем статусе. Проверьте «Мои отклики»."
  }

  if (err.status === 404) {
    return "Заказ не найден или уже закрыт для откликов."
  }

  return err.message || fallback
}
