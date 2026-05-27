import { FileText, Download } from "lucide-react"
import type { ChatMessageAttachment } from "@/lib/api/types"

function isImageMime(mime: string): boolean {
  return mime.startsWith("image/")
}

export function ChatMessageAttachments({
  attachments,
  isMe,
}: {
  attachments: ChatMessageAttachment[]
  isMe?: boolean
}) {
  if (!attachments.length) return null

  return (
    <div className={`mt-2 space-y-2 ${attachments.length > 0 && !isMe ? "" : ""}`}>
      {attachments.map((att) => {
        if (isImageMime(att.mime_type)) {
          return (
            <a
              key={att.id}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={att.url}
                alt={att.original_name}
                className="max-w-full max-h-48 rounded-lg object-cover border border-black/10"
              />
            </a>
          )
        }
        return (
          <a
            key={att.id}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm underline-offset-2 hover:underline ${
              isMe ? "bg-blue-600/30 text-white" : "bg-gray-200 text-gray-900"
            }`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate flex-1">{att.original_name}</span>
            <Download className="h-4 w-4 shrink-0 opacity-70" />
          </a>
        )
      })}
    </div>
  )
}
