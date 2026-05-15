"use client"

import { useRef } from "react"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

const DEFAULT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp"

interface FileUploadFieldProps {
  label: string
  hint?: string
  accept?: string
  value: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
  required?: boolean
}

export function FileUploadField({
  label,
  hint,
  accept = DEFAULT_ACCEPT,
  value,
  onChange,
  disabled,
  required,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed border-gray-200"
          : "cursor-pointer border-gray-300 hover:border-green-500 hover:bg-green-50/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {value ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-green-600 shrink-0" />
          <div className="text-left min-w-0 flex-1">
            <p className="font-medium truncate">{value.name}</p>
            <p className="text-sm text-gray-500">{(value.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              onChange(null)
              if (inputRef.current) inputRef.current.value = ""
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <>
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {hint && <p className="text-sm text-gray-600 mt-1">{hint}</p>}
        </>
      )}
    </div>
  )
}

