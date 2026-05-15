"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Play, Download, ExternalLink, Loader2, ArrowLeft } from "lucide-react"
import { getCourseDetail } from "@/lib/api"
import type { Course, CourseMaterial } from "@/lib/api/types"
import { toast } from "sonner"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      try {
        const detail = await getCourseDetail(courseId)
        setCourse(detail.course)
        setMaterials(detail.materials ?? [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не удалось загрузить курс"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  // ---------------------------------------------------------------------------
  // Render a single material based on its type (requirement 7.8)
  // ---------------------------------------------------------------------------
  const renderMaterial = (material: CourseMaterial) => {
    switch (material.type) {
      case "video":
        return (
          <div key={material.id} className="space-y-2">
            <p className="font-medium text-sm">{material.title}</p>
            {material.url && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={material.url}
                  title={material.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )
      case "pdf":
        return (
          <div key={material.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Download className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{material.title}</span>
            {material.url && (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Скачать
              </a>
            )}
          </div>
        )
      case "link":
        return (
          <div key={material.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{material.title}</span>
            {material.url && (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Открыть
              </a>
            )}
          </div>
        )
      case "text":
        return (
          <div key={material.id} className="space-y-2">
            <p className="font-medium text-sm">{material.title}</p>
            {material.content && (
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: material.content }}
              />
            )}
          </div>
        )
      default:
        return null
    }
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Not found
  // ---------------------------------------------------------------------------
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <Card className="text-center p-8">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Курс не найден</h2>
              <p className="text-gray-600 mb-4">Запрашиваемый курс не существует или был удалён</p>
              <Button asChild>
                <Link href="/courses">Вернуться к курсам</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Course header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к курсам
          </Link>

          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 hover:bg-white/30">{course.category}</Badge>
              <Badge
                className={
                  course.status === "published"
                    ? "bg-green-500/80 hover:bg-green-500"
                    : "bg-gray-500/80 hover:bg-gray-500"
                }
              >
                {course.status === "published"
                  ? "Опубликован"
                  : course.status === "draft"
                  ? "Черновик"
                  : "Архив"}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{course.title}</h1>
            <p className="text-lg text-blue-100 leading-relaxed">{course.description}</p>

            <p className="text-sm text-blue-200">
              Добавлен: {new Date(course.created_at).toLocaleDateString("ru-RU")}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="materials">
              Материалы {materials.length > 0 && `(${materials.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>О курсе</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4 mt-6">
            {materials.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Материалы курса пока недоступны</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Материалы курса</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {materials.map((material) => renderMaterial(material))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
