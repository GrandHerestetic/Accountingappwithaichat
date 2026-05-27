"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2, Paperclip, Send } from "lucide-react"
import { uploadFile } from "@/lib/api"
import { toast } from "sonner"

const MAX_FILE_BYTES = 10 * 1024 * 1024

type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: (text: string, attachmentIds?: string[]) => Promise<void>
  onTyping?: () => void
  disabled?: boolean
  placeholder?: string
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  onTyping,
  disabled,
  placeholder = "Введите сообщение...",
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const handleSend = async () => {
    const text = value.trim()
    if (!text || disabled || uploading) return
    setSendError(null)
    try {
      await onSend(text)
      onChange("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось отправить"
      setSendError(msg)
      toast.error(msg)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || disabled) return

    if (file.size > MAX_FILE_BYTES) {
      toast.error("Файл не больше 10 МБ")
      return
    }

    setSendError(null)
    setUploading(true)
    try {
      const uploaded = await uploadFile(file)
      const caption = value.trim()
      await onSend(caption, [uploaded.id])
      onChange("")
      toast.success("Файл отправлен")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось отправить файл"
      setSendError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {sendError && (
        <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {sendError}
        </p>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          onChange={(e) => void handleFileChange(e)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Прикрепить файл"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1">
          <Input
            placeholder={placeholder}
            value={value}
            disabled={disabled || uploading}
            onChange={(e) => {
              onChange(e.target.value)
              onTyping?.()
            }}
            onKeyDown={handleKeyPress}
          />
        </div>
        <Button
          type="button"
          onClick={() => void handleSend()}
          disabled={disabled || uploading || !value.trim()}
          className="bg-blue-500 hover:bg-blue-600"
          aria-label="Отправить"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
