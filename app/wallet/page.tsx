"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, Plus, CreditCard, ArrowUpRight, ArrowDownLeft, Filter, Download, CalendarIcon, X } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [topUpAmount, setTopUpAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)

  // Фильтры
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [transactionType, setTransactionType] = useState<string>("all")
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])

  const balance = 15000
  const transactions = [
    {
      id: 1,
      type: "expense",
      description: "Отклик на заказ 'Ведение бухучета'",
      amount: -1000,
      date: "2024-01-25T10:30:00",
      status: "completed",
    },
    {
      id: 2,
      type: "expense",
      description: "Получение контактов заказчика",
      amount: -800,
      date: "2024-01-24T15:20:00",
      status: "completed",
    },
    {
      id: 3,
      type: "income",
      description: "Пополнение баланса",
      amount: 10000,
      date: "2024-01-20T09:15:00",
      status: "completed",
    },
    {
      id: 4,
      type: "income",
      description: "Оплата за заказ #1234",
      amount: 45000,
      date: "2024-01-18T14:45:00",
      status: "completed",
    },
    {
      id: 5,
      type: "expense",
      description: "Отклик на заказ 'Налоговое консультирование'",
      amount: -700,
      date: "2024-01-15T11:10:00",
      status: "completed",
    },
  ]

  const handleTopUp = () => {
    if (!topUpAmount || Number.parseInt(topUpAmount) < 1000) {
      alert("Минимальная сумма пополнения: 1000 ₸")
      return
    }
    alert(`Баланс пополнен на ${topUpAmount} ₸`)
    setTopUpAmount("")
  }

  const handleWithdraw = () => {
    if (!withdrawAmount || Number.parseInt(withdrawAmount) < 1000) {
      alert("Минимальная сумма вывода: 1000 ₸")
      return
    }
    if (Number.parseInt(withdrawAmount) > balance) {
      alert("Недостаточно средств на балансе")
      return
    }
    alert(`Заявка на вывод ${withdrawAmount} ₸ создана`)
    setWithdrawAmount("")
    setIsWithdrawDialogOpen(false)
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Фильтр по типу транзакции
    if (transactionType !== "all") {
      filtered = filtered.filter((t) => t.type === transactionType)
    }

    // Фильтр по дате
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

  const getTransactionIcon = (type: string) => {
    return type === "income" ? (
      <ArrowDownLeft className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-red-600" />
    )
  }

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
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Кошелек</h1>
            <p className="text-gray-600">Управляйте своими финансами и транзакциями</p>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Wallet className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Текущий баланс</h2>
                  </div>
                  <p className="text-4xl font-bold">{balance.toLocaleString()} ₸</p>
                  <p className="text-green-100 mt-2">Доступно для использования</p>
                </div>
                <div className="text-right">
                  <Button className="bg-white text-green-600 hover:bg-gray-100 mb-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Пополнить
                  </Button>
                  <br />
                  <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Вывести
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Вывод средств</DialogTitle>
                        <DialogDescription>Введите сумму для вывода. Минимальная сумма: 1,000 ₸</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="withdraw-amount">Сумма вывода</Label>
                          <Input
                            id="withdraw-amount"
                            placeholder="Введите сумму"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                          <p className="text-xs text-gray-500">Доступно: {balance.toLocaleString()} ₸</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setWithdrawAmount("5000")}
                            className="text-xs"
                          >
                            5,000 ₸
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setWithdrawAmount("10000")}
                            className="text-xs"
                          >
                            10,000 ₸
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setWithdrawAmount(balance.toString())}
                            className="text-xs"
                          >
                            Все
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleWithdraw} className="flex-1">
                            Вывести средства
                          </Button>
                          <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>История транзакций</CardTitle>
                    <div className="flex gap-2">
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

                            {/* Фильтр по типу */}
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

                            {/* Фильтр по дате от */}
                            <div className="space-y-2">
                              <Label>Дата от</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal bg-transparent"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFrom ? format(dateFrom, "PPP", { locale: ru }) : "Выберите дату"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Фильтр по дате до */}
                            <div className="space-y-2">
                              <Label>Дата до</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal bg-transparent"
                                  >
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
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Экспорт
                      </Button>
                    </div>
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

                    {displayTransactions.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Транзакции не найдены</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Up Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-green-600" />
                    Пополнить баланс
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Сумма пополнения</Label>
                    <Input
                      id="amount"
                      placeholder="Введите сумму"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Минимальная сумма: 1,000 ₸</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setTopUpAmount("5000")} className="text-xs">
                      5,000 ₸
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setTopUpAmount("10000")} className="text-xs">
                      10,000 ₸
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setTopUpAmount("25000")} className="text-xs">
                      25,000 ₸
                    </Button>
                  </div>

                  <Button onClick={handleTopUp} className="w-full bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Пополнить
                  </Button>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Статистика за месяц</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Доходы:</span>
                    <span className="font-medium text-green-600">+55,000 ₸</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Расходы:</span>
                    <span className="font-medium text-red-600">-2,500 ₸</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Итого:</span>
                    <span className="font-bold text-green-600">+52,500 ₸</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Способы оплаты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Kaspi Bank</p>
                      <p className="text-sm text-gray-600">**** 1234</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Добавить карту
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
