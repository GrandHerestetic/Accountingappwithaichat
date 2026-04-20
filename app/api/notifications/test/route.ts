import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, payload } = body

    if (!subscription) {
      return NextResponse.json({ error: "Subscription is required" }, { status: 400 })
    }

    console.log("Test notification request:", {
      endpoint: subscription.endpoint,
      payload: payload || {
        title: "Тестовое уведомление",
        body: "Push-уведомления работают корректно!",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully",
    })
  } catch (error) {
    console.error("Test notification error:", error)
    return NextResponse.json({ error: "Failed to send test notification" }, { status: 500 })
  }
}
