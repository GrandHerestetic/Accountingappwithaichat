"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  FileText,
  LinkIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Video,
  X,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"
import {
  archiveCoachCourse,
  createCoachCourseMaterial,
  deleteCoachCourse,
  deleteCoachCourseMaterial,
  getCoachCourseDetail,
  publishCoachCourse,
  updateCoachCourse,
  updateCoachCourseMaterial,
  uploadFile,
} from "@/lib/api"
import type { Course, CourseMaterial } from "@/lib/api/types"
import {
  COURSE_STATUS_LABELS,
  MODERATION_STATUS_COLORS,
  MODERATION_STATUS_LABELS,
  sortMaterials,
} from "@/lib/course-utils"

type MaterialDraft = {
  key: string
  id?: string
  title: string
  type: "video" | "pdf" | "link" | "text"
  url: string
  content: string
  file?: File | null
}

const newMaterialKey = () => `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const emptyMaterial = (): MaterialDraft => ({
  key: newMaterialKey(),
  title: "",
  type: "video",
  url: "",
  content: "",
  file: null,
})

function materialFromApi(material: CourseMaterial): MaterialDraft {
  return {
    key: material.id,
    id: material.id,
    title: material.title,
    type: material.type,
    url: material.url ?? "",
    content: material.content ?? "",
  }
}

function EditCourseContent() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [course, setCourse] = useState<Course | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [materials, setMaterials] = useState<MaterialDraft[]>([])
  const [removedMaterialIds, setRemovedMaterialIds] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const detail = await getCoachCourseDetail(courseId)
        setCourse(detail.course)
        setTitle(detail.course.title)
        setDescription(detail.course.description ?? "")
        setMaterials(sortMaterials(detail.materials ?? []).map(materialFromApi))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Не удалось загрузить курс")
        router.push("/coach/courses")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [courseId, router])

  const updateMaterial = (key: string, patch: Partial<MaterialDraft>) => {
    setMaterials((prev) => prev.map((m) => (m.key === key ? { ...m, ...patch } : m)))
  }

  const removeMaterial = (material: MaterialDraft) => {
    if (material.id) {
      setRemovedMaterialIds((prev) => [...prev, material.id!])
    }
    setMaterials((prev) => prev.filter((m) => m.key !== material.key))
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
        if (!material.url.trim() && !material.file && !material.id) {
          toast.error(`Загрузите PDF или укажите ссылку для «${material.title}»`)
          return false
        }
      } else if (material.type !== "text" && !material.url.trim() && !material.id) {
        toast.error(`Добавьте ссылку для материала «${material.title}»`)
        return false
      }
    }
    return true
  }

  const syncMaterials = async () => {
    for (const materialId of removedMaterialIds) {
      await deleteCoachCourseMaterial(courseId, materialId)
    }

    for (let i = 0; i < materials.length; i++) {
      const material = materials[i]
      const position = i + 1

      if (material.type === "pdf" && material.file) {
        const uploaded = await uploadFile(material.file)
        if (material.id) {
          await updateCoachCourseMaterial(courseId, material.id, {
            title: material.title.trim(),
            type: material.type,
            position,
            upload_id: uploaded.id,
          })
        } else {
          await createCoachCourseMaterial(courseId, {
            title: material.title.trim(),
            type: material.type,
            position,
            upload_id: uploaded.id,
          })
        }
        continue
      }

      const payload = {
        title: material.title.trim(),
        type: material.type,
        position,
        ...(material.type === "text"
          ? { content: material.content.trim() }
          : material.url.trim()
            ? { url: material.url.trim() }
            : {}),
      }

      if (material.id) {
        await updateCoachCourseMaterial(courseId, material.id, payload)
      } else {
        await createCoachCourseMaterial(courseId, payload)
      }
    }
  }

  const handleSave = async (submitForModeration = false) => {
    if (!validateBasic()) return
    if (submitForModeration && !validateMaterials()) return

    setSaving(true)
    try {
      await updateCoachCourse(courseId, {
        title: title.trim(),
        description: description.trim(),
      })
      await syncMaterials()
      if (submitForModeration) {
        await publishCoachCourse(courseId)
        toast.success("Изменения сохранены, курс отправлен на модерацию")
      } else {
        toast.success("Изменения сохранены")
      }
      router.push("/coach/courses")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить курс")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!course) return
    setDeleting(true)
    try {
      if (course.status === "published") {
        await archiveCoachCourse(courseId)
        toast.success("Курс отправлен в архив")
      } else {
        await deleteCoachCourse(courseId)
        toast.success("Курс удалён")
      }
      router.push("/coach/courses")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить курс")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!course) return null

  const canSubmitModeration =
    course.status === "draft" &&
    (course.moderation_status === "draft" || course.moderation_status === "rejected")
  const isArchived = course.status === "archived"

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
          <Link href="/coach/courses" className="text-sm font-medium text-purple-600">
            Мои курсы
          </Link>
        </nav>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/coach/courses">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Редактирование курса</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{COURSE_STATUS_LABELS[course.status]}</Badge>
                  {course.moderation_status && (
                    <Badge className={MODERATION_STATUS_COLORS[course.moderation_status]}>
                      {MODERATION_STATUS_LABELS[course.moderation_status]}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {!isArchived && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {course.status === "published" ? "В архив" : "Удалить"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {course.status === "published" ? "Отправить курс в архив?" : "Удалить курс?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {course.status === "published"
                        ? "Курс исчезнет из каталога, но данные сохранятся в архиве."
                        : "Черновик будет удалён без возможности восстановления."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => void handleDelete()}
                    >
                      {course.status === "published" ? "В архив" : "Удалить"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Основная информация</TabsTrigger>
                  <TabsTrigger value="content">
                    Материалы {materials.length > 0 && `(${materials.length})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название курса *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isArchived}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание курса *</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isArchived}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-6">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Материалы курса</h3>
                      <p className="text-sm text-gray-600">Редактируйте этапы, добавляйте или удаляйте материалы</p>
                    </div>
                    {!isArchived && (
                      <Button
                        type="button"
                        onClick={() => setMaterials((prev) => [...prev, emptyMaterial()])}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить материал
                      </Button>
                    )}
                  </div>

                  {materials.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center text-gray-600">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        Материалов пока нет
                      </CardContent>
                    </Card>
                  ) : (
                    materials.map((material, index) => (
                      <Card key={material.key}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Этап {index + 1}</CardTitle>
                            {!isArchived && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMaterial(material)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Название *</Label>
                              <Input
                                value={material.title}
                                onChange={(e) => updateMaterial(material.key, { title: e.target.value })}
                                disabled={isArchived}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Тип *</Label>
                              <Select
                                value={material.type}
                                onValueChange={(value: MaterialDraft["type"]) =>
                                  updateMaterial(material.key, { type: value })
                                }
                                disabled={isArchived}
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
                                rows={4}
                                value={material.content}
                                onChange={(e) => updateMaterial(material.key, { content: e.target.value })}
                                disabled={isArchived}
                              />
                            </div>
                          ) : material.type === "pdf" ? (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>PDF-файл</Label>
                                <Input
                                  type="file"
                                  accept="application/pdf"
                                  disabled={isArchived}
                                  onChange={(e) =>
                                    updateMaterial(material.key, { file: e.target.files?.[0] ?? null })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>или URL</Label>
                                <Input
                                  placeholder="https://..."
                                  value={material.url}
                                  onChange={(e) => updateMaterial(material.key, { url: e.target.value })}
                                  disabled={isArchived}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label>URL *</Label>
                              <Input
                                placeholder="https://..."
                                value={material.url}
                                onChange={(e) => updateMaterial(material.key, { url: e.target.value })}
                                disabled={isArchived}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>

              {!isArchived && (
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t">
                  <Button variant="outline" onClick={() => void handleSave(false)} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Сохранение..." : "Сохранить изменения"}
                  </Button>
                  {canSubmitModeration && (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => void handleSave(true)}
                      disabled={saving}
                    >
                      {saving ? "Отправка..." : "Сохранить и отправить на модерацию"}
                    </Button>
                  )}
                </div>
              )}

              {isArchived && (
                <Card className="mt-8 border-slate-200 bg-slate-50">
                  <CardHeader>
                    <CardTitle className="text-base">Курс в архиве</CardTitle>
                    <CardDescription>Редактирование недоступно</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function EditCoursePage() {
  return (
    <ProtectedRoute allowedRoles={["coach"]}>
      <EditCourseContent />
    </ProtectedRoute>
  )
}
