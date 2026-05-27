"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { consumePaymentReturnPath } from "@/lib/payment"

export default function PaymentReturnPage() {
  const router = useRouter()
  const [returnPath, setReturnPath] = useState("/")

  useEffect(() => {
    setReturnPath(consumePaymentReturnPath("/"))
  }, [])

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Оплата</CardTitle>
          <CardDescription>
            Если вы завершили оплату в Kaspi, статус заказа или отклика обновится автоматически в течение
            минуты. Обновите страницу в личном кабинете.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={() => router.push(returnPath)}>Вернуться в кабинет</Button>
          <Button variant="outline" asChild>
            <Link href="/">На главную</Link>
          </Button>
          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Ожидание подтверждения от платёжной системы
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
