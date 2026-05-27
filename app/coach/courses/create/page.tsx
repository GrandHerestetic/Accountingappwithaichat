"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, LinkIcon, Plus, Save, ArrowLeft, Briefcase, Video, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  createCoachCourse,
  createCoachCourseMaterial,
  publishCoachCourse,
  updateCoachCourseMaterial,
  uploadCoachCourseMaterial,
} from "@/lib/api"

type MaterialDraft = {
  id: number
  title: string
  type: "video" | "pdf" | "link" | "text"
  url: string
  content: string
  file?: File | null
}

const emptyMaterial = (): MaterialDraft => ({
  id: Date.now(),
  title: "",
  type: "video",
  url: "",
  content: "",
  file: null,
})

export default function CreateCoursePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [materials, setMaterials] = useState<MaterialDraft[]>([])

  const updateMaterial = (id: number, patch: Partial<MaterialDraft>) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  const removeMaterial = (id: number) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  const validateBasic = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Укажите название и описание курса")
      return false
    }
    return true
  }

  const validateMaterials = () => {
    for (const material of materials) {
      if (!material.title.trim()) {
        toast.error("У каждого материала должно быть название")
        return false
      }
      if (material.type === "text" && !material.content.trim()) {
        toast.error(`Добавьте текст для материала «${material.title}»`)
        return false
      }
      if (material.type === "pdf") {
        if (!material.url.trim() && !material.file) {
          toast.error(`Загрузите PDF или укажите ссылку для «${material.title}»`)
          return false
        }
      } else if (material.type !== "text" && !material.url.trim()) {
        toast.error(`Добавьте ссылку для материала «${material.title}»`)
        return false
      }
    }
    return true
  }

  const getMaterialsToSave = () =>
    materials.filter((material) => {
      if (!material.title.trim()) return false
      if (material.type === "text") return material.content.trim().length > 0
      if (material.type === "pdf") return material.url.trim().length > 0 || Boolean(material.file)
      return material.url.trim().length > 0
    })

  const saveMaterials = async (courseId: string, items: MaterialDraft[]) => {
    for (let i = 0; i < items.length; i++) {
      const material = items[i]
      const created = await createCoachCourseMaterial(courseId, {
        title: material.title.trim(),
        type: material.type,
        position: i + 1,
        ...(material.type === "text"
          ? { content: material.content.trim() }
          : {
              url:
                material.url.trim() ||
                (material.type === "pdf" && material.file ? "https://pending.upload" : ""),
            }),
      })

      if (material.type === "pdf" && material.file) {
        const uploaded = await uploadCoachCourseMaterial(courseId, created.id, material.file)
        await updateCoachCourseMaterial(courseId, created.id, { url: uploaded.download_url })
      }
    }
  }

  const handleSaveDraft = async () => {
    if (!validateBasic()) return
    setSaving(true)
    try {
      const course = await createCoachCourse({
        title: title.trim(),
        description: description.trim(),
      })
      await saveMaterials(course.id, getMaterialsToSave())
      toast.success("Черновик сохранён")
      router.push("/coach/courses")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!validateBasic() || !validateMaterials()) return
    setSaving(true)
    try {
      const course = await createCoachCourse({
        title: title.trim(),
        description: description.trim(),
      })
      await saveMaterials(course.id, materials)
      await publishCoachCourse(course.id)
      toast.success("Курс опубликован")
      router.push("/coach/courses")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка публикации")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
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
        </nav>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/coach/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Создание курса</h1>
              <p className="text-gray-600">Название, описание и материалы сохраняются через API</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Основная информация</TabsTrigger>
                  <TabsTrigger value="content">Материалы</TabsTrigger>
                  <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название курса *</Label>
                    <Input
                      id="title"
                      placeholder="Введите название курса"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание курса *</Label>
                    <Textarea
                      id="description"
                      placeholder="Подробное описание курса"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Материалы курса</h3>
                      <p className="text-sm text-gray-600">Видео, PDF, ссылки или текстовые блоки</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setMaterials((prev) => [...prev, emptyMaterial()])}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить материал
                    </Button>
                  </div>

                  {materials.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center text-gray-600">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        Материалы необязательны — можно добавить их позже
                      </CardContent>
                    </Card>
                  ) : (
                    materials.map((material, index) => (
                      <Card key={material.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Материал {index + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMaterial(material.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Название *</Label>
                              <Input
                                placeholder="Название материала"
                                value={material.title}
                                onChange={(e) => updateMaterial(material.id, { title: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Тип *</Label>
                              <Select
                                value={material.type}
                                onValueChange={(value: MaterialDraft["type"]) =>
                                  updateMaterial(material.id, { type: value })
                                }
                              >
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
                                  <SelectItem value="text">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      Текст
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {material.type === "text" ? (
                            <div className="space-y-2">
                              <Label>Текст *</Label>
                              <Textarea
                                placeholder="Содержимое материала"
                                rows={4}
                                value={material.content}
                                onChange={(e) => updateMaterial(material.id, { content: e.target.value })}
                              />
                            </div>
                          ) : material.type === "pdf" ? (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>PDF-файл</Label>
                                <Input
                                  type="file"
                                  accept="application/pdf"
                                  onChange={(e) =>
                                    updateMaterial(material.id, {
                                      file: e.target.files?.[0] ?? null,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>или URL</Label>
                                <Input
                                  placeholder="https://..."
                                  value={material.url}
                                  onChange={(e) => updateMaterial(material.id, { url: e.target.value })}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label>URL *</Label>
                              <Input
                                placeholder="https://..."
                                value={material.url}
                                onChange={(e) => updateMaterial(material.id, { url: e.target.value })}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="preview" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Предпросмотр</CardTitle>
                      <CardDescription>Так курс будет отображаться в каталоге</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{title || "Название курса"}</h3>
                        <p className="text-gray-600">{description || "Описание курса"}</p>
                      </div>
                      {materials.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Материалы ({materials.length})</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {materials.map((m, i) => (
                              <li key={m.id}>
                                {i + 1}. {m.title || "Без названия"} ({m.type})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

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
