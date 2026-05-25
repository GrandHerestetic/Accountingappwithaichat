/** Category slugs accepted by POST /api/v1/orders (Swagger / backend seed). */
export const ORDER_CATEGORIES = [
  { slug: "bookkeeping", label: "Бухгалтерский учёт" },
  { slug: "tax", label: "Налоговое консультирование" },
  { slug: "audit", label: "Аудиторские услуги" },
  { slug: "reporting", label: "Подготовка отчётности" },
  { slug: "payroll", label: "Зарплата и кадры" },
  { slug: "consulting", label: "Финансовый консалтинг" },
] as const

export type OrderCategorySlug = (typeof ORDER_CATEGORIES)[number]["slug"]

export const ORDER_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  ORDER_CATEGORIES.map((c) => [c.slug, c.label])
)

export function orderCategoryLabel(slug?: string | null): string {
  if (!slug) return ""
  return ORDER_CATEGORY_LABELS[slug] ?? slug
}
