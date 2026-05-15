"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ExecutorOrderChatRedirect({ params }: { params: { id: string } }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/chat/${params.id}`)
  }, [params.id, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  )
}
