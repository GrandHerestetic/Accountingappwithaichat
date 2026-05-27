"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Wallet, ArrowUpRight, ArrowDownLeft, Filter, CalendarIcon, X, Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { useMyWallet } from "@/hooks/use-swr-hooks"
import { toast } from "sonner"

export default function WalletPage() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [transactionType, setTransactionType] = useState<string>("all")
  const [filteredTransactions, setFilteredTransactions] = useState<
    { id: string; type: string; description: string; amount: number; date: string; status: string }[]
  >([])

  const { data, isLoading, error } = useMyWallet()
  const walletUnavailable = error instanceof Error && /недоступен|501|not_implemented/i.test(error.message)

  const balance = data?.wallet.balance ?? 0
  const currency = data?.wallet.currency ?? "KZT"

  const transactions = useMemo(
    () =>
      (data?.transactions ?? []).map((t) => ({
        id: t.id,
        type: t.direction === "credit" ? "income" : "expense",
        description: t.reason,
        amount: t.direction === "credit" ? t.amount : -t.amount,
        date: t.created_at,
        status: "completed",
      })),
    [data?.transactions],
  )

  useEffect(() => {
    if (error && !walletUnavailable) {
      toast.error(error instanceof Error ? error.message : "Не удалось загрузить кошелёк")
    }
  }, [error, walletUnavailable])

  const applyFilters = () => {
    let filtered = [...transactions]
    if (transactionType !== "all") {
      filtered = filtered.filter((t) => t.type === transactionType)
    }
    if (dateFrom) {
      filtered = filtered.filter((t) => new Date(t.date) >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((t) => new Date(t.date) <= dateTo)
    }
    setFilteredTransactions(filtered)
  }

  const clearFilters = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setTransactionType("all")
    setFilteredTransactions([])
  }

  const displayTransactions = filteredTransactions.length > 0 ? filteredTransactions : transactions

  const getTransactionIcon = (type: string) =>
    type === "income" ? (
      <ArrowDownLeft className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-red-600" />
    )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Завершено</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">В обработке</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Ошибка</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Кошелёк</h1>
            <p className="text-gray-600">Баланс и история операций с сервера</p>
          </div>

          {walletUnavailable && (
            <Card className="mb-8 border-amber-200 bg-amber-50">
              <CardContent className="p-6 text-amber-900">
                Кошелёк пока не подключён в API v2. Оплата откликов обрабатывается через dev-payments на
                стороне бэкенда.
              </CardContent>
            </Card>
          )}

          {!walletUnavailable && (
          <>
          <Card className="mb-8 bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Текущий баланс</h2>
              </div>
              <p className="text-4xl font-bold">
                {isLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin inline" />
                ) : (
                  `${balance.toLocaleString("ru-RU")} ${currency === "KZT" ? "₸" : currency}`
                )}
              </p>
              <p className="text-green-100 mt-2">Доступно для использования</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>История транзакций</CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Фильтр
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Фильтры транзакций</h4>
                      <div className="space-y-2">
                        <Label>Тип транзакции</Label>
                        <Select value={transactionType} onValueChange={setTransactionType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все транзакции</SelectItem>
                            <SelectItem value="income">Пополнения</SelectItem>
                            <SelectItem value="expense">Списания</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Дата от</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateFrom ? format(dateFrom, "PPP", { locale: ru }) : "Выберите дату"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Дата до</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateTo ? format(dateTo, "PPP", { locale: ru }) : "Выберите дату"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={applyFilters} className="flex-1">
                          Применить
                        </Button>
                        <Button variant="outline" onClick={clearFilters}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">{getTransactionIcon(transaction.type)}</div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount.toLocaleString()} ₸
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}

                {!isLoading && displayTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Транзакций пока нет</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </>
          )}
        </div>
      </main>
    </div>
  )
}
