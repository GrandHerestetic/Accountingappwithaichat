"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus, CheckCircle } from "lucide-react"
import { enrollInCourse } from "@/lib/api"
import { toast } from "sonner"
import { isEnrolledInCourse } from "@/lib/course-utils"
import type { CourseAssignment } from "@/lib/api/types"

interface CourseEnrollButtonProps {
  courseId: string
  assignment?: CourseAssignment | null
  onEnrolled?: (assignment: CourseAssignment) => void
  className?: string
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline" | "secondary"
}

export function CourseEnrollButton({
  courseId,
  assignment,
  onEnrolled,
  className,
  size = "default",
  variant = "default",
}: CourseEnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const [localAssignment, setLocalAssignment] = useState<CourseAssignment | null>(assignment ?? null)

  useEffect(() => {
    setLocalAssignment(assignment ?? null)
  }, [assignment])

  const enrolled = isEnrolledInCourse(localAssignment)

  const handleEnroll = async () => {
    if (enrolled || loading) return

    setLoading(true)
    try {
      const result = await enrollInCourse(courseId)
      setLocalAssignment(result)
      onEnrolled?.(result)
      toast.success("Вы записаны на курс")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось записаться на курс"
      if (message.toLowerCase().includes("conflict") || message.includes("409")) {
        toast.info("Вы уже записаны на этот курс")
        if (localAssignment) {
          onEnrolled?.(localAssignment)
        }
      } else {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (enrolled) {
    return (
      <Button asChild variant="outline" size={size} className={className}>
        <Link href="/executor/courses">
          <CheckCircle className="h-4 w-4 mr-2" />
          В моих курсах
        </Link>
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      disabled={loading}
      onClick={handleEnroll}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      Записаться
    </Button>
  )
}
