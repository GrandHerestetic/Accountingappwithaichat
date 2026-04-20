import { type NextRequest, NextResponse } from "next/server"

const subscriptions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 })
    }

    // В реальном приложении здесь должна быть аутентификация пользователя
    const userId = request.headers.get("user-id") || "anonymous"

    // Сохраняем подписку
    subscriptions.set(subscription.endpoint, {
      userId,
      subscription,
      createdAt: new Date().toISOString(),
    })

    console.log(`Subscription saved for user ${userId}:`, subscription.endpoint)

    return NextResponse.json({
      success: true,
      message: "Subscription saved successfully",
    })
  } catch (error) {
    console.error("Subscribe API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
