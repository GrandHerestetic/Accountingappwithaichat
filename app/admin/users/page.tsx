"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowDownCircle, ArrowUpCircle, Loader2, Star, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAdminExecutors } from "@/hooks/use-swr-hooks"
import { promoteExecutorToCoach, revokeExecutorCoach } from "@/lib/api"
import { toast } from "sonner"
import type { AdminExecutorUser } from "@/lib/api/types"

function executorLabel(user: AdminExecutorUser) {
  return user.display_name?.trim() || user.email
}

function formatRating(avg: number, count: number) {
  const value = Number.isFinite(avg) ? avg.toFixed(1) : "—"
  const reviews =
    count === 0
      ? "нет отзывов"
      : count === 1
        ? "1 отзыв"
        : count < 5
          ? `${count} отзыва`
          : `${count} отзывов`
  return { value, reviews }
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  const [actingId, setActingId] = useState<string | null>(null)
  const [promoteUser, setPromoteUser] = useState<AdminExecutorUser | null>(null)
  const [revokeUser, setRevokeUser] = useState<AdminExecutorUser | null>(null)

  const { data, isLoading, mutate } = useAdminExecutors({
    page: 1,
    pageSize: 50,
    q: debouncedQ || undefined,
  })

  const executors = data?.items ?? []

  const handleSearch = () => {
    setDebouncedQ(searchQuery.trim())
  }

  const handlePromote = async () => {
    if (!promoteUser) return
    setActingId(promoteUser.user_id)
    try {
      const result = await promoteExecutorToCoach(promoteUser.user_id)
      toast.success(result.message || "Права коуча выданы")
      toast.info("Для доступа к разделам коуча пользователю нужен повторный вход")
      setPromoteUser(null)
      mutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось выдать права коуча")
    } finally {
      setActingId(null)
    }
  }

  const handleRevoke = async () => {
    if (!revokeUser) return
    setActingId(revokeUser.user_id)
    try {
      const result = await revokeExecutorCoach(revokeUser.user_id)
      toast.success(result.message || "Права коуча сняты")
      toast.info("Разделы коуча скроются после повторного входа пользователя")
      setRevokeUser(null)
      mutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось снять права коуча")
    } finally {
      setActingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Исполнители
          </h1>
          <p className="text-gray-600 mb-6">
            Выдача и снятие прав коуча: исполнитель остаётся исполнителем. Рейтинг и отзывы — из
            профиля исполнителя. После изменения прав нужен повторный вход пользователя.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Input
              placeholder="Поиск по email или имени..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="outline" onClick={handleSearch}>
              Найти
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : executors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                Исполнители не найдены
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {executors.map((user) => {
                const { value, reviews } = formatRating(user.rating_avg, user.rating_count)
                const busy = actingId === user.user_id
                return (
                  <Card key={user.user_id}>
                    <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">
                            {executorLabel(user)}
                          </p>
                          {!user.is_active && <Badge variant="secondary">Неактивен</Badge>}
                          {user.is_coach && (
                            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                              Коуч
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                          <span className="font-medium">{value}</span>
                          <span className="text-gray-500">· {reviews}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        {user.is_coach ? (
                          <Button
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50"
                            disabled={!user.is_active || busy}
                            onClick={() => setRevokeUser(user)}
                          >
                            {busy ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <ArrowDownCircle className="w-4 h-4 mr-2" />
                            )}
                            Снять права коуча
                          </Button>
                        ) : (
                          <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={!user.is_active || busy}
                            onClick={() => setPromoteUser(user)}
                          >
                            {busy ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <ArrowUpCircle className="w-4 h-4 mr-2" />
                            )}
                            Выдать права коуча
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {data && data.total > executors.length && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Показано {executors.length} из {data.total}
            </p>
          )}
        </div>

        <Dialog open={!!promoteUser} onOpenChange={(open) => !open && setPromoteUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выдать права коуча?</DialogTitle>
              <DialogDescription>
                {promoteUser && (
                  <>
                    <strong>{executorLabel(promoteUser)}</strong> ({promoteUser.email}) останется
                    исполнителем и получит доступ к курсам коуча. Рейтинг:{" "}
                    <strong>
                      {formatRating(promoteUser.rating_avg, promoteUser.rating_count).value}
                    </strong>
                    , отзывов: <strong>{promoteUser.rating_count}</strong>.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPromoteUser(null)}>
                Отмена
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!!actingId}
                onClick={() => void handlePromote()}
              >
                {actingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Подтвердить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!revokeUser} onOpenChange={(open) => !open && setRevokeUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Снять права коуча?</DialogTitle>
              <DialogDescription>
                {revokeUser && (
                  <>
                    <strong>{executorLabel(revokeUser)}</strong> ({revokeUser.email}) останется
                    исполнителем, но потеряет доступ к разделам коуча после следующего входа.
                    Созданные курсы в системе сохранятся.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRevokeUser(null)}>
                Отмена
              </Button>
              <Button
                variant="destructive"
                disabled={!!actingId}
                onClick={() => void handleRevoke()}
              >
                {actingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Снять права
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
