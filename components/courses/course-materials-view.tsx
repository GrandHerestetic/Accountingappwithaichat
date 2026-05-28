"use client"

import { Badge } from "@/components/ui/badge"
import { VideoEmbed } from "@/components/courses/video-embed"
import { Download, ExternalLink } from "lucide-react"
import type { CourseMaterial } from "@/lib/api/types"

function renderMaterialBody(material: CourseMaterial) {
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

interface CourseMaterialsViewProps {
  materials: CourseMaterial[]
  hint?: string
}

export function CourseMaterialsView({ materials, hint }: CourseMaterialsViewProps) {
  return (
    <div className="space-y-4">
      {hint && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          {hint}
        </div>
      )}
      {materials.map((material, index) => (
        <div key={material.id} className="rounded-lg border bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500">Этап {index + 1}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {material.type}
            </Badge>
          </div>
          <h3 className="font-semibold text-gray-900">{material.title}</h3>
          {renderMaterialBody(material)}
        </div>
      ))}
    </div>
  )
}
