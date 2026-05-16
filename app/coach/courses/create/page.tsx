"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Upload,
  Video,
  FileText,
  LinkIcon,
  Plus,
  X,
  Save,
  Eye,
  ArrowLeft,
  Award,
  Clock,
  Users,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createCoachCourse, publishCoachCourse } from "@/lib/api"

export default function CreateCoursePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    price: "",
    duration: "",
    language: "ru",
    tags: [],
    isFree: false,
    hasCertificate: true,
    modules: [],
  })

  const [newTag, setNewTag] = useState("")
  const [modules, setModules] = useState([
    {
      id: 1,
      title: "",
      description: "",
      lessons: [],
    },
  ])

  const categories = [
    "Налоговый учет",
    "МСФО",
    "Восстановление учета",
    "Автоматизация",
    "Аудит",
    "Управленческий учет",
    "Финансовый анализ",
    "Кадровый учет",
  ]

  const levels = ["Начинающий", "Средний", "Продвинутый", "Эксперт"]

  const handleSaveDraft = async () => {
    if (!courseData.title.trim() || !courseData.description.trim()) {
      toast.error("Укажите название и описание курса")
      return
    }
    setSaving(true)
    try {
      await createCoachCourse({
        title: courseData.title.trim(),
        description: courseData.description.trim(),
      })
      toast.success("Черновик сохранён")
      router.push("/coach/courses")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!courseData.title.trim() || !courseData.description.trim()) {
      toast.error("Укажите название и описание курса")
      return
    }
    setSaving(true)
    try {
      const course = await createCoachCourse({
        title: courseData.title.trim(),
        description: courseData.description.trim(),
      })
      await publishCoachCourse(course.id)
      toast.success("Курс опубликован")
      router.push("/coach/courses")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка публикации")
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData({
        ...courseData,
        tags: [...courseData.tags, newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setCourseData({
      ...courseData,
      tags: courseData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: modules.length + 1,
        title: "",
        description: "",
        lessons: [],
      },
    ])
  }

  const addLesson = (moduleId) => {
    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                {
                  id: module.lessons.length + 1,
                  title: "",
                  type: "video",
                  content: "",
                  duration: "",
                },
              ],
            }
          : module,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Header */}
      <header className="px-4 lg:px-6 h-20 flex items-center bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center justify-center">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BuhPro
          </span>
        </Link>
        <nav className="ml-auto flex gap-8">
          <Link
            href="/coach/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Дашборд
          </Link>
          <Link href="/coach/courses" className="text-sm font-medium text-purple-600">
            Мои курсы
          </Link>
          <Link
            href="/coach/students"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Студенты
          </Link>
          <Link
            href="/coach/analytics"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Аналитика
          </Link>
        </nav>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/coach/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Создание курса</h1>
              <p className="text-gray-600">Создайте новый обучающий курс для студентов</p>
            </div>
          </div>

          {/* Course Creation Form */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Основная информация</TabsTrigger>
                  <TabsTrigger value="content">Содержание</TabsTrigger>
                  <TabsTrigger value="pricing">Цены и доступ</TabsTrigger>
                  <TabsTrigger value="preview">Предварительный просмотр</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Название курса *</Label>
                      <Input
                        id="title"
                        placeholder="Введите название курса"
                        value={courseData.title}
                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Категория *</Label>
                      <Select
                        value={courseData.category}
                        onValueChange={(value) => setCourseData({ ...courseData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание курса *</Label>
                    <Textarea
                      id="description"
                      placeholder="Подробное описание курса, что изучат студенты"
                      rows={4}
                      value={courseData.description}
                      onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="level">Уровень сложности</Label>
                      <Select
                        value={courseData.level}
                        onValueChange={(value) => setCourseData({ ...courseData, level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите уровень" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Продолжительность</Label>
                      <Input
                        id="duration"
                        placeholder="например: 8 часов"
                        value={courseData.duration}
                        onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Язык курса</Label>
                      <Select
                        value={courseData.language}
                        onValueChange={(value) => setCourseData({ ...courseData, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="kz">Казахский</SelectItem>
                          <SelectItem value="en">Английский</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Теги курса</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Добавить тег"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                      />
                      <Button onClick={addTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {courseData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Course Image Upload */}
                  <div className="space-y-2">
                    <Label>Обложка курса</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Загрузите изображение обложки</p>
                      <p className="text-sm text-gray-500">PNG, JPG до 5MB. Рекомендуемый размер: 1280x720</p>
                      <Button variant="outline" className="mt-4">
                        Выбрать файл
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Модули курса</h3>
                    <Button onClick={addModule} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить модуль
                    </Button>
                  </div>

                  {modules.map((module, moduleIndex) => (
                    <Card key={module.id} className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Модуль {moduleIndex + 1}</CardTitle>
                          <Button variant="ghost" size="sm">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Название модуля</Label>
                            <Input placeholder="Введите название модуля" />
                          </div>
                          <div className="space-y-2">
                            <Label>Описание модуля</Label>
                            <Input placeholder="Краткое описание" />
                          </div>
                        </div>

                        {/* Lessons */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Уроки</h4>
                            <Button size="sm" variant="outline" onClick={() => addLesson(module.id)}>
                              <Plus className="w-3 h-3 mr-1" />
                              Добавить урок
                            </Button>
                          </div>

                          {module.lessons.map((lesson, lessonIndex) => (
                            <Card key={lesson.id} className="bg-gray-50">
                              <CardContent className="p-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label>Название урока</Label>
                                    <Input placeholder="Название урока" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Тип контента</Label>
                                    <Select defaultValue="video">
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="video">
                                          <div className="flex items-center gap-2">
                                            <Video className="w-4 h-4" />
                                            Видео
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="pdf">
                                          <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            PDF
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="link">
                                          <div className="flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4" />
                                            Ссылка
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Длительность</Label>
                                    <Input placeholder="10 мин" />
                                  </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                  <Label>Контент</Label>
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Загрузите файл или вставьте ссылку</p>
                                    <Button size="sm" variant="outline" className="mt-2">
                                      Выбрать файл
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6 mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ценообразование</CardTitle>
                        <CardDescription>Установите цену для вашего курса</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="free-course"
                            checked={courseData.isFree}
                            onCheckedChange={(checked) => setCourseData({ ...courseData, isFree: checked })}
                          />
                          <Label htmlFor="free-course">Бесплатный курс</Label>
                        </div>

                        {!courseData.isFree && (
                          <div className="space-y-2">
                            <Label htmlFor="price">Цена курса (₸)</Label>
                            <Input
                              id="price"
                              type="number"
                              placeholder="15000"
                              value={courseData.price}
                              onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Дополнительные опции</CardTitle>
                        <CardDescription>Настройте дополнительные возможности</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="certificate"
                            checked={courseData.hasCertificate}
                            onCheckedChange={(checked) => setCourseData({ ...courseData, hasCertificate: checked })}
                          />
                          <Label htmlFor="certificate">Выдавать сертификат</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch id="lifetime" defaultChecked />
                          <Label htmlFor="lifetime">Пожизненный доступ</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch id="mobile" defaultChecked />
                          <Label htmlFor="mobile">Доступ с мобильного</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch id="downloads" />
                          <Label htmlFor="downloads">Материалы для скачивания</Label>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Test/Quiz Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Тестирование и сертификация</CardTitle>
                      <CardDescription>Добавьте тесты для проверки знаний студентов</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="has-test" />
                          <Label htmlFor="has-test">Добавить итоговый тест</Label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Минимальный балл для прохождения (%)</Label>
                            <Input type="number" placeholder="70" />
                          </div>
                          <div className="space-y-2">
                            <Label>Количество попыток</Label>
                            <Select defaultValue="3">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 попытка</SelectItem>
                                <SelectItem value="3">3 попытки</SelectItem>
                                <SelectItem value="unlimited">Неограниченно</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Предварительный просмотр курса</CardTitle>
                      <CardDescription>Посмотрите, как будет выглядеть ваш курс для студентов</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg p-6 bg-white">
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{courseData.title || "Название курса"}</h3>
                            <p className="text-gray-600 mb-3">{courseData.description || "Описание курса"}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{courseData.duration || "8 часов"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>0 студентов</span>
                              </div>
                              {courseData.hasCertificate && (
                                <div className="flex items-center gap-1">
                                  <Award className="w-4 h-4" />
                                  <span>Сертификат</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {courseData.isFree ? "Бесплатно" : `${courseData.price || "15000"} ₸`}
                            </div>
                            <Badge className="bg-purple-100 text-purple-800">{courseData.level || "Начинающий"}</Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Теги:</h4>
                          <div className="flex flex-wrap gap-2">
                            {courseData.tags.length > 0 ? (
                              courseData.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-500">Теги не добавлены</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Сохранение..." : "Сохранить как черновик"}
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handlePublish}
                  disabled={saving}
                >
                  {saving ? "Публикация..." : "Опубликовать курс"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
