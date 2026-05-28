"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, AlertTriangle, Shield, Loader2, BookOpen } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import {
  listAdminCourseAssignments,
  listAdminCourses,
  listAdminExecutorLeads,
  listAdminSanctions,
  listOrders,
} from "@/lib/api"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    orders: 0,
    courseAssignments: 0,
    activeSanctions: 0,
    pendingCourses: 0,
    pendingExecutorLeads: 0,
  })

  useEffect(() => {
    Promise.all([
      listOrders({ page: 1, pageSize: 1 }),
      listAdminCourseAssignments({ page: 1, pageSize: 1 }),
      listAdminSanctions({ page: 1, pageSize: 50 }),
      listAdminCourses({ page: 1, pageSize: 1, moderationStatus: "in_review" }),
      listAdminExecutorLeads({ page: 1, pageSize: 1, status: "new" }),
    ])
      .then(([orders, assignments, sanctions, pendingCourses, newLeads]) => {
        setStats({
          orders: orders.total,
          courseAssignments: assignments.total,
          activeSanctions: sanctions.items.filter((s) => s.status === "active").length,
          pendingCourses: pendingCourses.total,
          pendingExecutorLeads: newLeads.total,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <Navigation />
        <main className="py-8 container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold mb-8">
            Админ-панель · {user?.profile?.profile_name ?? user?.email}
          </h1>

          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <Briefcase className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold">{stats.orders}</p>
                    <p className="text-sm text-gray-600">Заказов на платформе</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold">{stats.courseAssignments}</p>
                    <p className="text-sm text-gray-600">Назначений курсов</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                    <p className="text-2xl font-bold">{stats.activeSanctions}</p>
                    <p className="text-sm text-gray-600">Активных санкций</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-3">
                  <Link href="/admin/executor-leads">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Заявки исполнителей ({stats.pendingExecutorLeads})
                    </Button>
                  </Link>
                  <Link href="/admin/moderation">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Санкции
                    </Button>
                  </Link>
                  <Link href="/admin/disputes">
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Санкции ({stats.activeSanctions})
                    </Button>
                  </Link>
                  <Link href="/admin/orders">
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Заказы
                    </Button>
                  </Link>
                  <Link href="/admin/courses">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Модерация курсов ({stats.pendingCourses})
                    </Button>
                  </Link>
                  <Link href="/admin/course-assignments">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Назначение курсов ({stats.courseAssignments})
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Пользователи
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
