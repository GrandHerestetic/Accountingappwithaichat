"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Loader2, ArrowLeft, Star } from "lucide-react"
import { getCourseDetail, getEntityRating, listMyCourseAssignments } from "@/lib/api"
import type { Course, CourseAssignment, CourseMaterial, EntityRatingSummary } from "@/lib/api/types"
import { toast } from "sonner"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import {
  COURSE_STATUS_LABELS,
  assignmentMaterialsProgress,
  isEnrolledInCourse,
  sortMaterials,
} from "@/lib/course-utils"
import { useAuth } from "@/contexts/auth-context"
import { CourseEnrollButton } from "@/components/courses/course-enroll-button"
import { CourseMaterialsProgress } from "@/components/courses/course-materials-progress"
import { CourseMaterialsView } from "@/components/courses/course-materials-view"
import { CourseReviewForm } from "@/components/courses/course-review-form"

export default function CourseDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = params.id as string
  const { user } = useAuth()
  const isExecutor = user?.role === "executor"
  const isAdmin = user?.role === "admin"

  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [assignment, setAssignment] = useState<CourseAssignment | null>(null)
  const [courseRating, setCourseRating] = useState<EntityRatingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const canReview = isExecutor && assignment?.status === "completed"

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      try {
        const [detail, assignmentsData, ratingData] = await Promise.all([
          getCourseDetail(courseId),
          isExecutor
            ? listMyCourseAssignments({ page: 1, pageSize: 100 })
            : Promise.resolve({ items: [] as CourseAssignment[], total: 0, page: 1, page_size: 0 }),
          getEntityRating("course", courseId).catch(() => null),
        ])
        setCourse(detail.course)
        setMaterials(sortMaterials(detail.materials ?? []))
        setCourseRating(ratingData)
        const active = assignmentsData.items.find(
          (item) => item.course_id === courseId && isEnrolledInCourse(item)
        )
        setAssignment(active ?? null)
        if ((isAdmin || active) && detail.materials?.length) {
          setActiveTab("materials")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не удалось загрузить курс"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId, isExecutor, isAdmin])

  useEffect(() => {
    if (searchParams.get("tab") === "review" && canReview) {
      setActiveTab("review")
    }
  }, [searchParams, canReview])

  const refreshCourseRating = async () => {
    try {
      const ratingData = await getEntityRating("course", courseId)
      setCourseRating(ratingData)
    } catch {
      // ignore
    }
  }

  const materialsProgress = assignment ? assignmentMaterialsProgress(assignment) : null
  const ratingAvg = courseRating?.rating_avg ?? course?.rating_avg
  const ratingCount = courseRating?.rating_count ?? course?.rating_count ?? 0

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

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <Link
            href={isExecutor ? "/executor/courses" : isAdmin ? "/admin/courses" : "/courses"}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {isExecutor ? "Назад к моим курсам" : isAdmin ? "Назад к модерации" : "Назад к курсам"}
          </Link>

          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={
                  course.status === "published"
                    ? "bg-green-500/80 hover:bg-green-500"
                    : course.status === "draft"
                      ? "bg-gray-500/80 hover:bg-gray-500"
                      : "bg-slate-500/80 hover:bg-slate-500"
                }
              >
                {COURSE_STATUS_LABELS[course.status]}
              </Badge>
              {assignment?.status === "completed" && (
                <Badge className="bg-green-500/80">Завершён</Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{course.title}</h1>
            <p className="text-lg text-blue-100 leading-relaxed">{course.description}</p>

            {ratingCount > 0 && ratingAvg != null && (
              <div className="flex items-center gap-2 text-blue-100">
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
                <span className="font-medium">{ratingAvg.toFixed(1)}</span>
                <span className="text-sm">({ratingCount} отзывов)</span>
              </div>
            )}

            {materialsProgress && (
              <p className="text-sm text-blue-100">
                Прогресс: {materialsProgress.completed} из {materialsProgress.total} этапов
              </p>
            )}

            {isExecutor && course.status === "published" && !assignment && (
              <div className="pt-2">
                <CourseEnrollButton
                  courseId={course.id}
                  assignment={assignment}
                  className="bg-green-600 hover:bg-green-700"
                  onEnrolled={(next) => {
                    setAssignment(next)
                    if (materials.length > 0) setActiveTab("materials")
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${canReview ? "grid-cols-3" : "grid-cols-2"}`}>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="materials">
              Этапы {materials.length > 0 && `(${materials.length})`}
            </TabsTrigger>
            {canReview && <TabsTrigger value="review">Отзыв</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>О курсе</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
                {assignment && materials.length > 0 && (
                  <p className="text-sm text-gray-500 mt-4">
                    Пройдите все {materials.length} этапов на вкладке «Этапы», чтобы автоматически завершить курс.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4 mt-6">
            {materials.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Материалы курса пока недоступны</p>
                </CardContent>
              </Card>
            ) : !assignment && !isAdmin ? (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <p className="text-gray-600">
                    Запишитесь на курс, чтобы проходить этапы и отслеживать прогресс
                  </p>
                  {isExecutor && (
                    <CourseEnrollButton
                      courseId={course.id}
                      assignment={null}
                      onEnrolled={(next) => {
                        setAssignment(next)
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            ) : assignment ? (
              <CourseMaterialsProgress
                assignment={assignment}
                materials={materials}
                onAssignmentUpdate={setAssignment}
                onCourseCompleted={() => setActiveTab("review")}
              />
            ) : (
              <CourseMaterialsView
                materials={materials}
                hint="Просмотр материалов для модерации — запись на курс не требуется"
              />
            )}
          </TabsContent>

          {canReview && (
            <TabsContent value="review" className="space-y-4 mt-6">
              <CourseReviewForm
                courseId={course.id}
                assignmentId={assignment?.id}
                onSubmitted={() => void refreshCourseRating()}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
