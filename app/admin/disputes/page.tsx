"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAdminSanctions } from "@/hooks/use-swr-hooks"
import { liftAdminSanction } from "@/lib/api"
import { toast } from "sonner"
import { useState } from "react"

export default function AdminDisputesPage() {
  const { data, isLoading, mutate } = useAdminSanctions({ page: 1, pageSize: 50 })
  const [actingId, setActingId] = useState<string | null>(null)

  const sanctions = data?.items ?? []

  const handleLift = async (id: string) => {
    setActingId(id)
    try {
      await liftAdminSanction(id)
      toast.success("Санкция снята")
      mutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setActingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            Санкции и споры
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : sanctions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">Нет активных санкций</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sanctions.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-6 flex flex-wrap justify-between gap-4">
                    <div>
                      <Badge className={s.status === "active" ? "bg-red-100 text-red-800" : ""}>
                        {s.status}
                      </Badge>
                      <p className="font-medium mt-2">{s.reason}</p>
                      <p className="text-sm text-gray-600">
                        Серьёзность: {s.severity}/5 · с {new Date(s.started_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    {s.status === "active" && (
                      <Button
                        disabled={actingId === s.id}
                        onClick={() => handleLift(s.id)}
                      >
                        {actingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Снять санкцию"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
