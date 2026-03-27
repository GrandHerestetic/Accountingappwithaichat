export interface User {
  id: string
  name: string
  email: string
  type: "client" | "executor" | "coach" | "admin"
  avatar?: string
  isVerified?: boolean
  phone?: string
  company?: string
  specialization?: string
  rating?: number
  completedOrders?: number
  joinDate?: string
  bio?: string
}

export const DEMO_USERS: User[] = [
  // Клиенты
  {
    id: "client-1",
    name: "Иван Петров",
    email: "ivan.petrov@company.kz",
    type: "client",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (777) 123-45-67",
    company: "ТОО 'Казахстан Бизнес'",
    joinDate: "2023-01-15",
    bio: "Руководитель отдела закупок в крупной торговой компании. Ищу надежных исполнителей для ведения бухгалтерского учета.",
  },
  {
    id: "client-2",
    name: "Марина Сидорова",
    email: "marina.sidorova@startup.kz",
    type: "client",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (701) 987-65-43",
    company: "ИП 'Сидорова М.А.'",
    joinDate: "2023-03-22",
    bio: "Владелица интернет-магазина. Нужна помощь с налоговой отчетностью и ведением учета.",
  },
  {
    id: "client-3",
    name: "Алексей Козлов",
    email: "alexey.kozlov@holding.kz",
    type: "client",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (747) 555-12-34",
    company: "АО 'Казахстан Холдинг'",
    joinDate: "2022-11-08",
    bio: "Финансовый директор холдинга. Ищу экспертов для консультаций по международным стандартам учета.",
  },

  // Исполнители
  {
    id: "executor-1",
    name: "Анна Смирнова",
    email: "anna.smirnova@buhgalter.kz",
    type: "executor",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (775) 234-56-78",
    specialization: "Бухгалтерский учет и налогообложение",
    rating: 4.9,
    completedOrders: 127,
    joinDate: "2022-05-10",
    bio: "Сертифицированный бухгалтер с 8-летним опытом. Специализируюсь на ведении учета для малого и среднего бизнеса, налоговом планировании.",
  },
  {
    id: "executor-2",
    name: "Дмитрий Волков",
    email: "dmitry.volkov@audit.kz",
    type: "executor",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (702) 345-67-89",
    specialization: "Аудит и финансовый анализ",
    rating: 4.8,
    completedOrders: 89,
    joinDate: "2022-08-15",
    bio: "Аудитор с международной сертификацией. Провожу аудиторские проверки, финансовый анализ, консультирую по МСФО.",
  },
  {
    id: "executor-3",
    name: "Елена Кузнецова",
    email: "elena.kuznetsova@tax.kz",
    type: "executor",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (778) 456-78-90",
    specialization: "Налоговое консультирование",
    rating: 4.7,
    completedOrders: 156,
    joinDate: "2021-12-03",
    bio: "Налоговый консультант с опытом работы в КГД РК. Помогаю оптимизировать налоговую нагрузку, решаю спорные вопросы с налоговыми органами.",
  },
  {
    id: "executor-4",
    name: "Сергей Морозов",
    email: "sergey.morozov@1c.kz",
    type: "executor",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (771) 567-89-01",
    specialization: "Автоматизация учета, 1С",
    rating: 4.6,
    completedOrders: 203,
    joinDate: "2021-09-20",
    bio: "Специалист по внедрению и настройке 1С. Автоматизирую бухгалтерский учет, обучаю персонал работе с программами.",
  },

  // Коучи
  {
    id: "coach-1",
    name: "Елена Коучева",
    email: "elena.koucheva@business.kz",
    type: "coach",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (705) 678-90-12",
    specialization: "Бизнес-коучинг и финансовая грамотность",
    rating: 4.9,
    completedOrders: 45,
    joinDate: "2022-02-14",
    bio: "Сертифицированный бизнес-коуч с MBA. Провожу тренинги по финансовой грамотности, помогаю предпринимателям развивать бизнес.",
  },
  {
    id: "coach-2",
    name: "Максим Тренеров",
    email: "maxim.trenerov@education.kz",
    type: "coach",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (776) 789-01-23",
    specialization: "Корпоративное обучение",
    rating: 4.8,
    completedOrders: 67,
    joinDate: "2021-11-30",
    bio: "Эксперт по корпоративному обучению. Разрабатываю программы повышения квалификации для бухгалтеров и финансистов.",
  },

  // Администраторы
  {
    id: "admin-1",
    name: "Администратор Системы",
    email: "admin@buhpro.kz",
    type: "admin",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (727) 000-00-00",
    joinDate: "2021-01-01",
    bio: "Системный администратор платформы BuhPro. Отвечаю за техническую поддержку и модерацию контента.",
  },
  {
    id: "admin-2",
    name: "Айгуль Администратор",
    email: "aigul.admin@buhpro.kz",
    type: "admin",
    avatar: "/placeholder.svg?height=40&width=40",
    isVerified: true,
    phone: "+7 (727) 111-11-11",
    joinDate: "2021-06-15",
    bio: "Менеджер по работе с пользователями. Решаю спорные вопросы, провожу модерацию заказов и отзывов.",
  },
]

// Функция для получения пользователя по ID
export const getUserById = (id: string): User | undefined => {
  return DEMO_USERS.find((user) => user.id === id)
}

// Функция для получения пользователей по типу
export const getUsersByType = (type: User["type"]): User[] => {
  return DEMO_USERS.filter((user) => user.type === type)
}

// Функция для поиска пользователей
export const searchUsers = (query: string): User[] => {
  const lowercaseQuery = query.toLowerCase()
  return DEMO_USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.specialization?.toLowerCase().includes(lowercaseQuery) ||
      user.company?.toLowerCase().includes(lowercaseQuery),
  )
}
