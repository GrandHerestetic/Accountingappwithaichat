"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { AlertTriangle, Eye, Loader2, Trash2, CheckCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import {
  dismissAdminOrderReport,
  listAdminOrderReports,
  listOrders,
  removeOrderByAdminReport,
} from "@/lib/api"
import { toast } from "sonner"
import type { Order, OrderReport } from "@/lib/api/types"

const REPORT_STATUS_LABELS: Record<string, string> = {
  pending: "На рассмотрении",
  dismissed: "Заказ оставлен",
  order_removed: "Заказ удалён",
}

export default function AdminOrdersPage() {
  const [tab, setTab] = useState<"reports" | "orders">("reports")
  const [reportStatus, setReportStatus] = useState("pending")
  const [reports, setReports] = useState<OrderReport[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [actingId, setActingId] = useState<string | null>(null)
  const [reviewReport, setReviewReport] = useState<OrderReport | null>(null)
  const [reviewAction, setReviewAction] = useState<"dismiss" | "remove" | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

  const loadReports = useCallback(async () => {
    const data = await listAdminOrderReports({
      page: 1,
      pageSize: 50,
      status: reportStatus || undefined,
    })
    setReports(data.items)
  }, [reportStatus])

  const loadOrders = useCallback(async () => {
    const data = await listOrders({ page: 1, pageSize: 50, q: q || undefined })
    setOrders(data.items)
  }, [q])

  useEffect(() => {
    setLoading(true)
    const run = async () => {
      try {
        if (tab === "reports") {
          await loadReports()
        } else {
          await loadOrders()
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Не удалось загрузить данные")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [tab, loadReports, loadOrders])

  const handleReview = async () => {
    if (!reviewReport || !reviewAction) return
    setActingId(reviewReport.id)
    try {
      const result =
        reviewAction === "dismiss"
          ? await dismissAdminOrderReport(reviewReport.id, adminNotes)
          : await removeOrderByAdminReport(reviewReport.id, adminNotes)
      toast.success(result.message)
      setReviewReport(null)
      setReviewAction(null)
      setAdminNotes("")
      await loadReports()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось обработать жалобу")
    } finally {
      setActingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2">Управление заказами</h1>
          <p className="text-gray-600 mb-6">
            Жалобы исполнителей на заказы и общий список опубликованных заказов
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={tab === "reports" ? "default" : "outline"}
              onClick={() => setTab("reports")}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Жалобы
            </Button>
            <Button
              variant={tab === "orders" ? "default" : "outline"}
              onClick={() => setTab("orders")}
            >
              Все заказы
            </Button>
          </div>

          {tab === "reports" && (
            <select
              value={reportStatus}
              onChange={(e) => setReportStatus(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm mb-4"
            >
              <option value="pending">На рассмотрении</option>
              <option value="dismissed">Заказ оставлен</option>
              <option value="order_removed">Заказ удалён</option>
              <option value="">Все жалобы</option>
            </select>
          )}

          {tab === "orders" && (
            <Input
              placeholder="Поиск по заказам..."
              className="max-w-sm mb-4"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void loadOrders()}
            />
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : tab === "reports" ? (
            reports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Жалоб с выбранным фильтром нет
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => (
                  <Card key={r.id} className="border-l-4 border-l-amber-400">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-wrap justify-between gap-2">
                        <Badge variant="secondary">
                          {REPORT_STATUS_LABELS[r.status] ?? r.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(r.created_at).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{r.order_title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {r.order_description}
                        </p>
                        <p className="text-sm mt-1">
                          {r.order_budget?.toLocaleString()} {r.order_currency ?? "₸"} ·{" "}
                          {r.order_status}
                        </p>
                      </div>
                      <div className="rounded-md bg-amber-50 border border-amber-100 p-3 text-sm">
                        <p className="font-medium text-amber-900">Жалоба исполнителя</p>
                        <p className="text-amber-800 mt-1">
                          {r.reporter_name || r.reporter_email}: {r.reason}
                        </p>
                      </div>
                      {r.admin_notes && (
                        <p className="text-sm text-gray-600">
                          Комментарий админа: {r.admin_notes}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${r.order_id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Детали заказа
                          </Link>
                        </Button>
                      {r.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            disabled={actingId === r.id}
                            onClick={() => {
                              setReviewReport(r)
                              setReviewAction("dismiss")
                              setAdminNotes("")
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Оставить заказ
                          </Button>
                          <Button
                            variant="destructive"
                            disabled={actingId === r.id}
                            onClick={() => {
                              setReviewReport(r)
                              setReviewAction("remove")
                              setAdminNotes("")
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Удалить заказ
                          </Button>
                        </>
                      )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Card key={o.id}>
                  <CardContent className="p-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{o.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{o.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <Badge>{o.status}</Badge>
                        <p className="text-sm font-medium mt-1">
                          {o.budget_amount?.toLocaleString()} {o.currency ?? "₸"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/orders/${o.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          Подробнее
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog
          open={!!reviewReport && !!reviewAction}
          onOpenChange={(open) => {
            if (!open) {
              setReviewReport(null)
              setReviewAction(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === "remove" ? "Удалить заказ?" : "Оставить заказ?"}
              </DialogTitle>
              <DialogDescription>
                {reviewReport && (
                  <>
                    Заказ «{reviewReport.order_title}». Жалоба: {reviewReport.reason}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="admin-notes">Комментарий (необязательно)</Label>
              <Textarea
                id="admin-notes"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewReport(null)
                  setReviewAction(null)
                }}
              >
                Отмена
              </Button>
              <Button
                variant={reviewAction === "remove" ? "destructive" : "default"}
                disabled={!!actingId}
                onClick={() => void handleReview()}
              >
                {actingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Подтвердить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
