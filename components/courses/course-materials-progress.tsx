"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Download, ExternalLink, Loader2, Play } from "lucide-react"
import { VideoEmbed } from "@/components/courses/video-embed"
import { markCourseMaterialCompleted } from "@/lib/api"
import type { CourseAssignment, CourseMaterial } from "@/lib/api/types"
import { isMaterialCompleted } from "@/lib/course-utils"
import { toast } from "sonner"

interface CourseMaterialsProgressProps {
  assignment: CourseAssignment
  materials: CourseMaterial[]
  onAssignmentUpdate: (assignment: CourseAssignment) => void
  onCourseCompleted?: () => void
}

export function CourseMaterialsProgress({
  assignment,
  materials,
  onAssignmentUpdate,
  onCourseCompleted,
}: CourseMaterialsProgressProps) {
  const [markingMaterialId, setMarkingMaterialId] = useState<string | null>(null)

  const completedIds = new Set(assignment.progress?.completed_material_ids ?? [])
  const total = assignment.progress?.total_materials ?? materials.length
  const completed = assignment.progress?.completed_materials ?? completedIds.size
  const progressPercent = assignment.progress?.progress_percent ?? 0
  const courseCompleted = assignment.status === "completed"

  const handleCompleteMaterial = async (materialId: string) => {
    if (courseCompleted || isMaterialCompleted(assignment, materialId)) return

    setMarkingMaterialId(materialId)
    try {
      const updated = await markCourseMaterialCompleted(assignment.id, materialId)
      onAssignmentUpdate(updated)
      if (updated.status === "completed") {
        toast.success("Все этапы пройдены — курс автоматически завершён!")
        onCourseCompleted?.()
      } else {
        toast.success("Этап отмечен как пройденный")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось отметить этап")
    } finally {
      setMarkingMaterialId(null)
    }
  }

  const renderMaterialBody = (material: CourseMaterial) => {
    switch (material.type) {
      case "video":
        return material.url ? (
          <VideoEmbed url={material.url} title={material.title} />
        ) : null
      case "pdf":
        return material.url ? (
          <a
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 text-sm hover:underline mt-3"
          >
            <Download className="h-4 w-4" />
            Скачать PDF
          </a>
        ) : null
      case "link":
        return material.url ? (
          <a
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 text-sm hover:underline mt-3"
          >
            <ExternalLink className="h-4 w-4" />
            Открыть ссылку
          </a>
        ) : null
      case "text":
        return material.content ? (
          <div
            className="prose prose-sm max-w-none text-gray-700 mt-3"
            dangerouslySetInnerHTML={{ __html: material.content }}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-gray-900">
            Прогресс: {completed} из {total} этапов
          </p>
          {courseCompleted && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Курс завершён
            </Badge>
          )}
        </div>
        <Progress value={progressPercent} className="h-2" />
        <p className="text-sm text-gray-500">{progressPercent}% пройдено</p>
      </div>

      <div className="space-y-4">
        {materials.map((material, index) => {
          const done = completedIds.has(material.id) || isMaterialCompleted(assignment, material.id)
          const isMarking = markingMaterialId === material.id

          return (
            <div
              key={material.id}
              className={`rounded-lg border p-4 ${done ? "bg-green-50 border-green-200" : "bg-white"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-medium text-gray-500">Этап {index + 1}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {material.type}
                    </Badge>
                    {done && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Пройден
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{material.title}</h3>
                  {renderMaterialBody(material)}
                </div>

                {!courseCompleted && (
                  <Button
                    size="sm"
                    variant={done ? "outline" : "default"}
                    className={done ? "" : "bg-blue-600 hover:bg-blue-700"}
                    disabled={done || isMarking}
                    onClick={() => handleCompleteMaterial(material.id)}
                  >
                    {isMarking ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : done ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {done ? "Пройден" : "Отметить пройденным"}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
