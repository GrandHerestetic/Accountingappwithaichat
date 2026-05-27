"use client"

import { useRef } from "react"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MultiFileUploadFieldProps {
  label: string
  hint?: string
  accept?: string
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
}

export function MultiFileUploadField({
  label,
  hint,
  accept = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
  files,
  onChange,
  disabled,
  maxFiles = 10,
}: MultiFileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return
    const next = [...files, ...Array.from(list)]
    onChange(next.slice(0, maxFiles))
    if (inputRef.current) inputRef.current.value = ""
  }

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        onClick={() => !disabled && files.length < maxFiles && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled || files.length >= maxFiles
            ? "opacity-50 cursor-not-allowed border-gray-200"
            : "cursor-pointer border-gray-300 hover:border-blue-500 hover:bg-blue-50/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple
          disabled={disabled || files.length >= maxFiles}
          onChange={(e) => addFiles(e.target.files)}
        />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="font-medium">{label}</p>
        {hint && <p className="text-sm text-gray-600 mt-1">{hint}</p>}
        {files.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Выбрано файлов: {files.length}
            {maxFiles < 100 ? ` / ${maxFiles}` : ""}
          </p>
        )}
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={() => removeAt(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
