"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAdminExecutorLeads } from "@/hooks/use-swr-hooks"
import { useState } from "react"

export default function AdminUsersPage() {
  const [q, setQ] = useState("")
  const { data, isLoading } = useAdminExecutorLeads({ page: 1, pageSize: 100 })

  const leads =
    data?.items.filter((l) => {
      if (!q) return true
      const s = q.toLowerCase()
      return l.email?.toLowerCase().includes(s) || `${l.first_name} ${l.last_name}`.toLowerCase().includes(s)
    }) ?? []

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Пользователи (заявки исполнителей)</h1>
          <Input placeholder="Поиск..." className="max-w-sm mb-6" value={q} onChange={(e) => setQ(e.target.value)} />
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <div className="space-y-3">
              {leads.map((l) => (
                <Card key={l.id}>
                  <CardContent className="p-4 flex justify-between">
                    <div>
                      <p className="font-medium">
                        {l.first_name} {l.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{l.email}</p>
                    </div>
                    <Badge>{l.status ?? "new"}</Badge>
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
