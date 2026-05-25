"use client"

import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormFieldProps = {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive ml-1">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function fieldInputClass(error?: string, className?: string) {
  return cn(error && "border-destructive focus-visible:ring-destructive/30", className)
}

export function fieldAriaProps(error?: string, id?: string) {
  return {
    "aria-invalid": Boolean(error) || undefined,
    ...(error && id ? { "aria-describedby": `${id}-error` } : {}),
  } as const
}
