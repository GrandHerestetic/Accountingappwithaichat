"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Star, Home, MessageCircle, Repeat } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function OrderCompleteSuccessPage({ params }: { params: { id: string } }) {
  useEffect(() => {
    // Можно добавить аналитику или уведомления
    console.log(`Order ${params.id} completed successfully`)
  }, [params.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">Заказ успешно завершен!</h1>

              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Спасибо за вашу оценку! Исполнитель получил уведомление, а средства будут переведены в течение 24 часов.
              </p>

              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-sm text-gray-600">Ваша оценка:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/client/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Home className="w-4 h-4 mr-2" />
                    Вернуться к заказам
                  </Button>
                </Link>

                <Link href={`/chat/${params.id}`}>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Написать исполнителю
                  </Button>
                </Link>

                <Link href="/client/create-order">
                  <Button variant="outline">
                    <Repeat className="w-4 h-4 mr-2" />
                    Создать новый заказ
                  </Button>
                </Link>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Совет:</strong> Сохраните контакты исполнителя для будущих проектов. Вы можете найти их в
                  истории чатов.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
