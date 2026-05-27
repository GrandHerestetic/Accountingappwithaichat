"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Пользователи</h1>
          <p className="text-gray-600 mb-6">
            Список пользователей и заявок исполнителей (leads) отсутствует в API v2. Используйте
            модерацию санкций и назначения курсов.
          </p>
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Эндпоинт /api/v1/admin/users не реализован на бэкенде</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
