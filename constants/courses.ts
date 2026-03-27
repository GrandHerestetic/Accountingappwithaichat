export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorAvatar: string
  price: number
  originalPrice?: number
  rating: number
  studentsCount: number
  duration: string
  level: "Начинающий" | "Средний" | "Продвинутый"
  category: string
  tags: string[]
  image: string
  lessons: number
  certificate: boolean
  language: string
  lastUpdated: string
  whatYouWillLearn: string[]
  requirements: string[]
  modules: {
    title: string
    lessons: {
      title: string
      duration: string
      preview?: boolean
    }[]
  }[]
  reviews: {
    id: string
    userName: string
    userAvatar: string
    rating: number
    comment: string
    date: string
  }[]
}

export const COURSES: Course[] = [
  {
    id: "1",
    title: "Основы бухгалтерского учета в Казахстане",
    description:
      "Полный курс по основам бухгалтерского учета с учетом казахстанского законодательства. Изучите принципы ведения учета, составления отчетности и работы с первичными документами.",
    instructor: "Анна Смирнова",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    price: 25000,
    originalPrice: 35000,
    rating: 4.8,
    studentsCount: 1247,
    duration: "8 недель",
    level: "Начинающий",
    category: "Бухгалтерский учет",
    tags: ["Бухучет", "Казахстан", "Основы", "Отчетность"],
    image: "/placeholder.svg?height=200&width=300&text=Бухгалтерский+учет",
    lessons: 32,
    certificate: true,
    language: "Русский",
    lastUpdated: "2024-01-15",
    whatYouWillLearn: [
      "Основные принципы бухгалтерского учета",
      "Работа с первичными документами",
      "Составление баланса и отчетности",
      "Налоговое планирование",
      "Работа с программой 1С",
    ],
    requirements: [
      "Базовые знания математики",
      "Желание изучать бухгалтерский учет",
      "Компьютер с доступом в интернет",
    ],
    modules: [
      {
        title: "Введение в бухгалтерский учет",
        lessons: [
          { title: "Что такое бухгалтерский учет", duration: "15 мин", preview: true },
          { title: "Основные принципы учета", duration: "20 мин" },
          { title: "Нормативная база РК", duration: "25 мин" },
        ],
      },
      {
        title: "Первичные документы",
        lessons: [
          { title: "Виды первичных документов", duration: "18 мин" },
          { title: "Правила оформления", duration: "22 мин" },
          { title: "Практическое задание", duration: "30 мин" },
        ],
      },
    ],
    reviews: [
      {
        id: "1",
        userName: "Мария Иванова",
        userAvatar: "/placeholder.svg?height=32&width=32",
        rating: 5,
        comment: "Отличный курс! Все понятно объяснено, много практических примеров.",
        date: "2024-01-10",
      },
      {
        id: "2",
        userName: "Алексей Петров",
        userAvatar: "/placeholder.svg?height=32&width=32",
        rating: 4,
        comment: "Хороший курс для начинающих. Рекомендую!",
        date: "2024-01-08",
      },
    ],
  },
  {
    id: "2",
    title: "Налогообложение для ИП и ТОО",
    description:
      "Изучите особенности налогообложения индивидуальных предпринимателей и товариществ с ограниченной ответственностью в Казахстане.",
    instructor: "Елена Кузнецова",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    price: 30000,
    rating: 4.9,
    studentsCount: 892,
    duration: "6 недель",
    level: "Средний",
    category: "Налогообложение",
    tags: ["Налоги", "ИП", "ТОО", "Казахстан"],
    image: "/placeholder.svg?height=200&width=300&text=Налогообложение",
    lessons: 24,
    certificate: true,
    language: "Русский",
    lastUpdated: "2024-01-20",
    whatYouWillLearn: [
      "Налоговые режимы для ИП и ТОО",
      "Расчет и уплата налогов",
      "Налоговая отчетность",
      "Налоговые льготы и преференции",
      "Взаимодействие с налоговыми органами",
    ],
    requirements: [
      "Базовые знания налогового права",
      "Опыт ведения бизнеса (желательно)",
      "Компьютер с доступом в интернет",
    ],
    modules: [
      {
        title: "Налоговые режимы",
        lessons: [
          { title: "Обычный режим налогообложения", duration: "20 мин", preview: true },
          { title: "Упрощенная декларация", duration: "25 мин" },
          { title: "Статусы налогоплательщика", duration: "18 мин" },
        ],
      },
    ],
    reviews: [
      {
        id: "1",
        userName: "Дмитрий Сидоров",
        userAvatar: "/placeholder.svg?height=32&width=32",
        rating: 5,
        comment: "Очень полезный курс! Помог разобраться с налогами для моего ТОО.",
        date: "2024-01-12",
      },
    ],
  },
  {
    id: "3",
    title: "1С: Бухгалтерия для Казахстана",
    description:
      "Практический курс по работе с программой 1С: Бухгалтерия, адаптированной для казахстанского законодательства.",
    instructor: "Сергей Морозов",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    price: 40000,
    originalPrice: 50000,
    rating: 4.7,
    studentsCount: 1156,
    duration: "10 недель",
    level: "Средний",
    category: "Программное обеспечение",
    tags: ["1С", "Автоматизация", "Программа", "Практика"],
    image: "/placeholder.svg?height=200&width=300&text=1С+Бухгалтерия",
    lessons: 40,
    certificate: true,
    language: "Русский",
    lastUpdated: "2024-01-25",
    whatYouWillLearn: [
      "Настройка программы 1С",
      "Ведение справочников",
      "Проведение документов",
      "Формирование отчетов",
      "Закрытие периода",
    ],
    requirements: ["Базовые знания бухучета", "Установленная программа 1С", "Опыт работы с компьютером"],
    modules: [
      {
        title: "Знакомство с 1С",
        lessons: [
          { title: "Интерфейс программы", duration: "15 мин", preview: true },
          { title: "Настройка учетной политики", duration: "30 мин" },
          { title: "Справочники", duration: "25 мин" },
        ],
      },
    ],
    reviews: [
      {
        id: "1",
        userName: "Ольга Николаева",
        userAvatar: "/placeholder.svg?height=32&width=32",
        rating: 5,
        comment: "Отличный практический курс! Теперь уверенно работаю в 1С.",
        date: "2024-01-18",
      },
    ],
  },
  {
    id: "4",
    title: "Финансовый анализ предприятия",
    description:
      "Научитесь проводить комплексный финансовый анализ деятельности предприятия, оценивать финансовое состояние и принимать управленческие решения.",
    instructor: "Дмитрий Волков",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    price: 35000,
    rating: 4.6,
    studentsCount: 634,
    duration: "7 недель",
    level: "Продвинутый",
    category: "Финансовый анализ",
    tags: ["Анализ", "Финансы", "Управление", "Отчетность"],
    image: "/placeholder.svg?height=200&width=300&text=Финансовый+анализ",
    lessons: 28,
    certificate: true,
    language: "Русский",
    lastUpdated: "2024-01-30",
    whatYouWillLearn: [
      "Методы финансового анализа",
      "Анализ ликвидности и платежеспособности",
      "Оценка рентабельности",
      "Анализ деловой активности",
      "Прогнозирование банкротства",
    ],
    requirements: ["Знание основ бухучета", "Понимание финансовой отчетности", "Базовые знания Excel"],
    modules: [
      {
        title: "Основы финансового анализа",
        lessons: [
          { title: "Цели и задачи анализа", duration: "20 мин", preview: true },
          { title: "Источники информации", duration: "15 мин" },
          { title: "Методы анализа", duration: "25 мин" },
        ],
      },
    ],
    reviews: [
      {
        id: "1",
        userName: "Анна Козлова",
        userAvatar: "/placeholder.svg?height=32&width=32",
        rating: 4,
        comment: "Сложный, но очень полезный курс. Много практических примеров.",
        date: "2024-01-22",
      },
    ],
  },
  {
    id: "5",
    title: "Управленческий учет и бюджетирование",
    description: "Изучите принципы управленческого учета, постановку системы бюджетирования и контроля в организации.",
    instructor: "Елена Коучева",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    price: 45000,
    rating: 4.8,
    studentsCount: 423,
    duration: "9 недель",
    level: "Продвинутый",
    category: "Управленческий учет",
    tags: ["Управление", "Бюджетирование", "Планирование", "Контроль"],
    image: "/placeholder.svg?height=200&width=300&text=Управленческий+учет",
    lessons: 36,
    certificate: true,
    language: "Русский",
    lastUpdated: "2024-02-01",
    whatYouWillLearn: [
      "Основы управленческого учета",
      "Калькулирование себестоимости",
      "Бюджетирование и планирование",
      "Центры ответственности",
      "Управленческая отчетность",
    ],
    requirements: ["Опыт работы в бухгалтерии", "Знание Excel на среднем уровне", "Понимание бизнес-процессов"],
    modules: [
      {
        title: "Введение в управленческий учет",
        lessons: [
          { title: "Отличия от бухгалтерского учета", duration: "18 мин", preview: true },
          { title: "Задачи управленческого учета", duration: "22 мин" },
          { title: "Организация системы", duration: "25 мин" },
        ],
      },
    ],
    reviews: [
      {
        id: "1",
        userName: "Максим Петров",
        userAvatar: "/placeholder.svg?height=32&width=32",
        rating: 5,
        comment: "Превосходный курс! Помог внедрить управленческий учет в компании.",
        date: "2024-01-28",
      },
    ],
  },
  {
    id: "6",
    title: "МСФО: Международные стандарты финансовой отчетности",
    description:
      "Комплексное изучение международных стандартов финансовой отчетности (МСФО) с практическими примерами применения.",
    instructor: "Дмитрий Волков",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    price: 55000,
    originalPrice: 70000,
    rating: 4.9,
    studentsCount: 287,
    duration: "12 недель",
    level: "Продвинутый",
    category: "Международные стандарты",
    tags: ["МСФО", "Международные стандарты", "Отчетность", "Трансформация"],
    image: "/placeholder.svg?height=200&width=300&text=МСФО",
    lessons: 48,
    certificate: true,
    language: "Русский",
    lastUpdated: "2024-02-05",
    whatYouWillLearn: [
      "Основные принципы МСФО",
      "Трансформация отчетности",
      "Консолидация отчетности",
      "Справедливая стоимость",
      "Обесценение активов",
    ],
    requirements: [
      "Высшее экономическое образование",
      "Опыт работы главным бухгалтером",
      "Знание английского языка (базовый)",
    ],
    modules: [
      {
        title: "Концептуальные основы МСФО",
        lessons: [
          { title: "История развития МСФО", duration: "20 мин", preview: true },
          { title: "Принципы составления отчетности", duration: "30 мин" },
          { title: "Качественные характеристики", duration: "25 мин" },
        ],
      },
    ],
    reviews: [
      {
        id: "1",
        userName: "Светлана Иванова",
        userAvatar: "/placeholder.svg?height=32&width=32",
        rating: 5,
        comment: "Сложный, но очень качественный курс. Отличная подготовка к сертификации.",
        date: "2024-02-02",
      },
    ],
  },
]

export const getCourseById = (id: string): Course | undefined => {
  return COURSES.find((course) => course.id === id)
}

export const getCoursesByCategory = (category: string): Course[] => {
  return COURSES.filter((course) => course.category === category)
}

export const getCoursesByLevel = (level: string): Course[] => {
  return COURSES.filter((course) => course.level === level)
}

export const searchCourses = (query: string): Course[] => {
  const lowercaseQuery = query.toLowerCase()
  return COURSES.filter(
    (course) =>
      course.title.toLowerCase().includes(lowercaseQuery) ||
      course.description.toLowerCase().includes(lowercaseQuery) ||
      course.instructor.toLowerCase().includes(lowercaseQuery) ||
      course.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  )
}
