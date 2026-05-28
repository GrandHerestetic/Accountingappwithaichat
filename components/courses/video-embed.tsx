"use client"

import { ExternalLink } from "lucide-react"
import { toVideoEmbedUrl, isLikelyVideoHost } from "@/lib/video-embed-url"

interface VideoEmbedProps {
  url: string
  title: string
  className?: string
}

export function VideoEmbed({ url, title, className }: VideoEmbedProps) {
  const embedSrc = toVideoEmbedUrl(url)

  if (!embedSrc) {
    if (isLikelyVideoHost(url)) {
      return (
        <p className="text-sm text-amber-700 mt-3">
          Не удалось разобрать ссылку. Используйте формат{" "}
          <code className="text-xs bg-amber-50 px-1 rounded">
            https://www.youtube.com/watch?v=...
          </code>{" "}
          или{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            откройте видео в новой вкладке
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      )
    }
    return (
      <video
        src={url}
        controls
        className={`w-full rounded-lg mt-3 ${className ?? ""}`}
        title={title}
      />
    )
  }

  return (
    <div className={`aspect-video rounded-lg overflow-hidden bg-black mt-3 ${className ?? ""}`}>
      <iframe
        src={embedSrc}
        title={title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  )
}
