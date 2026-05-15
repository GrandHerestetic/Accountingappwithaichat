"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Eye,
  MessageCircle,
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Pencil,
  XCircle,
  Send,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import {
  cancelMyOrder,
  listMyOrders,
  submitMyOrder,
  updateMyOrder,
} from "@/lib/api"
import type { Order, OrderStatus } from "@/lib/api/types"
import { toast } from "sonner"

// ─── Status badge colors (Req 3.8) ──────────────────────────────────────────
const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  payment_pending: "bg-yellow-100 text-yellow-700",
  published: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Черновик",
  payment_pending: "Ожидает оплаты",
  published: "Опубликован",
  in_progress: "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
}

// ─── Edit dialog state ───────────────────────────────────────────────────────
interface EditState {
  open: boolean
  order: Order | null
  title: string
  description: string
  budget: string
}

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("active")
  const { user } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page] = useState(1)

  // Cancel confirmation dialog
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  })
  const [isCancelling, setIsCancelling] = useState(false)

  // Edit dialog
  const [editState, setEditState] = useState<EditState>({
    open: false,
    order: null,
    title: "",
    description: "",
    budget: "",
  })
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Submit in-progress
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  // ── Fetch orders (Req 3.2) ─────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await listMyOrders({ page, pageSize: 20 })
      setOrders(data.items)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Не удалось загрузить заказы"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = {
    activeOrders: orders.filter((o) => o.status === "published" || o.status === "in_progress").length,
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
  }

  // ── Status badge ───────────────────────────────────────────────────────────
  const getStatusBadge = (status: OrderStatus) => (
    <Badge className={ORDER_STATUS_COLORS[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
  )

  // ── Submit order (Req 3.4, 3.5) ────────────────────────────────────────────
  const handleSubmitOrder = async (orderId: string) => {
    setSubmittingId(orderId)
    try {
      const result = await submitMyOrder(orderId)
      if (result?.checkout_url) {
        window.open(result.checkout_url, "_blank")
      } else {
        toast.success("Заказ отправлен на публикацию!")
        await fetchOrders()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Не удалось отправить заказ"
      toast.error(message)
    } finally {
      setSubmittingId(null)
    }
  }

  // ── Cancel order (Req 3.7) ─────────────────────────────────────────────────
  const openCancelDialog = (orderId: string) => {
    setCancelDialog({ open: true, orderId })
  }

  const confirmCancel = async () => {
    if (!cancelDialog.orderId) return
    setIsCancelling(true)
    try {
      await cancelMyOrder(cancelDialog.orderId)
      toast.success("Заказ отменён")
      setCancelDialog({ open: false, orderId: null })
      await fetchOrders()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Не удалось отменить заказ"
      toast.error(message)
    } finally {
      setIsCancelling(false)
    }
  }

  // ── Edit order (Req 3.3) ───────────────────────────────────────────────────
  const openEditDialog = (order: Order) => {
    setEditState({
      open: true,
      order,
      title: order.title,
      description: order.description,
      budget: String(order.budget_amount),
    })
  }

  const saveEdit = async () => {
    if (!editState.order) return
    const patch: Partial<{ title: string; description: string; budget_amount: number }> = {}
    if (editState.title.trim() !== editState.order.title) patch.title = editState.title.trim()
    if (editState.description.trim() !== editState.order.description)
      patch.description = editState.description.trim()
    const budgetNum = parseFloat(editState.budget)
    if (!isNaN(budgetNum) && budgetNum !== editState.order.budget_amount) patch.budget_amount = budgetNum

    if (Object.keys(patch).length === 0) {
      setEditState((s) => ({ ...s, open: false }))
      return
    }

    setIsSavingEdit(true)
    try {
      await updateMyOrder(editState.order.id, patch)
      toast.success("Заказ обновлён")
      setEditState((s) => ({ ...s, open: false }))
      await fetchOrders()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Не удалось обновить заказ"
      toast.error(message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  // ── Filtered order lists ───────────────────────────────────────────────────
  const activeOrders = orders.filter(
    (o) => o.status === "draft" || o.status === "payment_pending" || o.status === "published",
  )
  const inProgressOrders = orders.filter((o) => o.status === "in_progress")
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled")

  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />

        <main className="section-padding">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
              <div>
                <h1 className="text-responsive-xl font-bold text-gray-900">
                  Добро пожаловать, {user?.profile?.profile_name ?? user?.email}! 👋
                </h1>
                <p className="text-sm md:text-base text-gray-600">Управляйте своими заказами и исполнителями</p>
              </div>
              <Link href="/client/create-order">
                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="mobile-text-base">Создать заказ</span>
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              <Card>
                <CardContent className="card-responsive">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Активные заказы</p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                    </div>
                    <div className="p-2 md:p-3 bg-blue-100 rounded-full">
                      <Clock className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="card-responsive">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Всего заказов</p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <div className="p-2 md:p-3 bg-green-100 rounded-full">
                      <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="card-responsive">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Завершено</p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                    </div>
                    <div className="p-2 md:p-3 bg-purple-100 rounded-full">
                      <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="card-responsive">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">В работе</p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900">{inProgressOrders.length}</p>
                    </div>
                    <div className="p-2 md:p-3 bg-yellow-100 rounded-full">
                      <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Tabs */}
            <Card>
              <CardHeader className="card-responsive">
                <CardTitle className="text-lg md:text-xl">Мои заказы</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Управляйте активными и завершенными заказами
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Загрузка заказов...</div>
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="px-4 md:px-6">
                      <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger value="active" className="text-xs md:text-sm py-2 md:py-3">
                          Активные ({activeOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="in_progress" className="text-xs md:text-sm py-2 md:py-3">
                          В работе ({inProgressOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="text-xs md:text-sm py-2 md:py-3">
                          Завершённые ({completedOrders.length})
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Active orders tab */}
                    <TabsContent value="active" className="space-y-4 mt-6 px-4 md:px-6 pb-6">
                      {activeOrders.length === 0 && (
                        <p className="text-center text-gray-500 py-8">Нет активных заказов</p>
                      )}
                      {activeOrders.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="card-responsive">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                              <div className="flex-1 w-full">
                                <h3 className="text-base md:text-lg font-semibold mb-2">{order.title}</h3>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                    {new Date(order.created_at).toLocaleDateString("ru-RU")}
                                  </span>
                                  <span>{order.category_slug}</span>
                                  <span>{order.budget_amount.toLocaleString()} ₸</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  {getStatusBadge(order.status)}
                                </div>
                              </div>
                              <div className="w-full lg:w-auto">
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Link href={`/client/order/${order.id}/responses`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full sm:w-auto text-xs md:text-sm bg-transparent"
                                    >
                                      <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                      Отклики
                                    </Button>
                                  </Link>
                                  {order.status === "draft" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:w-auto text-xs md:text-sm bg-transparent"
                                        onClick={() => openEditDialog(order)}
                                      >
                                        <Pencil className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                        Редактировать
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-xs md:text-sm"
                                        onClick={() => handleSubmitOrder(order.id)}
                                        disabled={submittingId === order.id}
                                      >
                                        <Send className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                        {submittingId === order.id ? "Отправка..." : "Отправить"}
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto text-xs md:text-sm text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                    onClick={() => openCancelDialog(order.id)}
                                  >
                                    <XCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                    Отменить
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    {/* In-progress tab */}
                    <TabsContent value="in_progress" className="space-y-4 mt-6 px-4 md:px-6 pb-6">
                      {inProgressOrders.length === 0 && (
                        <p className="text-center text-gray-500 py-8">Нет заказов в работе</p>
                      )}
                      {inProgressOrders.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-orange-500">
                          <CardContent className="card-responsive">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                              <div className="flex-1 w-full">
                                <h3 className="text-base md:text-lg font-semibold mb-2">{order.title}</h3>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                    {new Date(order.updated_at).toLocaleDateString("ru-RU")}
                                  </span>
                                  <span>{order.category_slug}</span>
                                  <span>{order.budget_amount.toLocaleString()} ₸</span>
                                </div>
                                {getStatusBadge(order.status)}
                              </div>
                              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start lg:items-center gap-4">
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                  <Link href={`/chat/${order.id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full sm:w-auto text-xs md:text-sm bg-transparent"
                                    >
                                      <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                      Чат
                                    </Button>
                                  </Link>
                                  <Link href={`/client/order/${order.id}/complete`}>
                                    <Button
                                      size="sm"
                                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                                    >
                                      Завершить заказ
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    {/* Completed/cancelled tab */}
                    <TabsContent value="completed" className="space-y-4 mt-6 px-4 md:px-6 pb-6">
                      {completedOrders.length === 0 && (
                        <p className="text-center text-gray-500 py-8">Нет завершённых заказов</p>
                      )}
                      {completedOrders.map((order) => (
                        <Card
                          key={order.id}
                          className={`border-l-4 ${order.status === "completed" ? "border-l-green-500" : "border-l-red-400"}`}
                        >
                          <CardContent className="card-responsive">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                              <div className="flex-1 w-full">
                                <h3 className="text-base md:text-lg font-semibold mb-2">{order.title}</h3>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
                                  <span>
                                    {order.status === "completed" ? "Завершён" : "Отменён"}{" "}
                                    {new Date(order.updated_at).toLocaleDateString("ru-RU")}
                                  </span>
                                  <span>{order.category_slug}</span>
                                  <span>{order.budget_amount.toLocaleString()} ₸</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  {getStatusBadge(order.status)}
                                </div>
                              </div>
                              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start lg:items-center gap-4">
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                  {order.status === "completed" && (
                                    <Link href={`/client/order/${order.id}/complete`}>
                                      <Button
                                        size="sm"
                                        className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-xs md:text-sm"
                                      >
                                        Оценить работу
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Cancel confirmation dialog (Req 3.7) */}
        <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, orderId: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Отменить заказ?</DialogTitle>
              <DialogDescription>
                Это действие нельзя отменить. Заказ будет переведён в статус «Отменён».
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialog({ open: false, orderId: null })}
                disabled={isCancelling}
              >
                Назад
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Отмена..." : "Да, отменить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit dialog (Req 3.3) */}
        <Dialog open={editState.open} onOpenChange={(open) => !open && setEditState((s) => ({ ...s, open: false }))}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Редактировать заказ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Название</Label>
                <Input
                  id="edit-title"
                  value={editState.title}
                  onChange={(e) => setEditState((s) => ({ ...s, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Описание</Label>
                <Textarea
                  id="edit-description"
                  rows={4}
                  value={editState.description}
                  onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-budget">Бюджет (₸)</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  value={editState.budget}
                  onChange={(e) => setEditState((s) => ({ ...s, budget: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditState((s) => ({ ...s, open: false }))}
                disabled={isSavingEdit}
              >
                Отмена
              </Button>
              <Button onClick={saveEdit} disabled={isSavingEdit}>
                {isSavingEdit ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
