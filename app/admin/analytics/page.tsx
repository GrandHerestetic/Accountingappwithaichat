"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, ShoppingCart, CreditCard, BarChart3, Download } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("revenue")
  const [timeRange, setTimeRange] = useState("month")

  // Mock financial stats
  const financialStats = {
    totalRevenue: 2450000,
    monthlyGrowth: 15.3,
    totalCommission: 1250000,
    promotionRevenue: 890000,
    responseRevenue: 310000,
    averageOrderValue: 35000,
    totalTransactions: 1234,
    successRate: 97.2,
    refundRate: 1.8,
    topCategory: "Ведение учета",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Финансовая аналитика</h1>
              <p className="text-gray-600">Доходы, комиссии и транзакции платформы</p>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Последняя неделя</SelectItem>
                  <SelectItem value="month">Последний месяц</SelectItem>
                  <SelectItem value="quarter">Последний квартал</SelectItem>
                  <SelectItem value="year">Последний год</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Download className="w-4 h-4 mr-2" />
                Экспорт отчета
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Общий доход</p>
                    <p className="text-2xl font-bold text-gray-900">{financialStats.totalRevenue.toLocaleString()} ₸</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+{financialStats.monthlyGrowth}%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Комиссии с заказов</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {financialStats.totalCommission.toLocaleString()} ₸
                    </p>
                    <p className="text-sm text-gray-500">51% от общего дохода</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего транзакций</p>
                    <p className="text-2xl font-bold text-gray-900">{financialStats.totalTransactions}</p>
                    <p className="text-sm text-green-600">Успешность: {financialStats.successRate}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Средний чек</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {financialStats.averageOrderValue.toLocaleString()} ₸
                    </p>
                    <p className="text-sm text-gray-500">За заказ</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="revenue">Доходы</TabsTrigger>
                  <TabsTrigger value="transactions">Транзакции</TabsTrigger>
                  <TabsTrigger value="commissions">Комиссии</TabsTrigger>
                  <TabsTrigger value="payments">Платежи</TabsTrigger>
                </TabsList>

                {/* Revenue Analytics */}
                <TabsContent value="revenue" className="space-y-6 mt-6">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Динамика доходов</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                            <p className="text-gray-500">График доходов будет здесь</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Структура доходов</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <div>
                                <p className="font-medium">Комиссии с заказов</p>
                                <p className="text-sm text-gray-600">51% от общего дохода</p>
                              </div>
                              <p className="font-bold text-blue-600">
                                {financialStats.totalCommission.toLocaleString()} ₸
                              </p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <div>
                                <p className="font-medium">Продвижение заказов</p>
                                <p className="text-sm text-gray-600">36% от общего дохода</p>
                              </div>
                              <p className="font-bold text-green-600">
                                {financialStats.promotionRevenue.toLocaleString()} ₸
                              </p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                              <div>
                                <p className="font-medium">Отклики исполнителей</p>
                                <p className="text-sm text-gray-600">13% от общего дохода</p>
                              </div>
                              <p className="font-bold text-yellow-600">
                                {financialStats.responseRevenue.toLocaleString()} ₸
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-6 mt-6">
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Статистика транзакций</h3>
                    <p className="text-gray-600">Детальная аналитика транзакций будет здесь</p>
                  </div>
                </TabsContent>

                <TabsContent value="commissions" className="space-y-6 mt-6">
                  <div className="text-center py-8">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Анализ комиссий</h3>
                    <p className="text-gray-600">Распределение комиссий по категориям будет здесь</p>
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="space-y-6 mt-6">
                  <div className="text-center py-8">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Способы оплаты</h3>
                    <p className="text-gray-600">Статистика по способам оплаты будет здесь</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
