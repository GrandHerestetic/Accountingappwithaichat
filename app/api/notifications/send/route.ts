import { type NextRequest, NextResponse } from "next/server"

const subscriptions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, message, chatId, senderName } = body

    if (!userId || !message) {
      return NextResponse.json({ error: "userId and message are required" }, { status: 400 })
    }

    // Находим все подписки пользователя
    const userSubscriptions = Array.from(subscriptions.values()).filter((sub) => sub.userId === userId)

    if (userSubscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions found for user" }, { status: 200 })
    }

    const notificationPayload = {
      title: "Новое сообщение в чате",
      body: `${senderName}: ${message.length > 50 ? message.substring(0, 50) + "..." : message}`,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      url: `/chat/${chatId}`,
      chatId,
      senderId: message.senderId,
      data: {
        timestamp: Date.now(),
        type: "chat_message",
        chatId,
        messageId: message.id,
      },
    }

    // В реальном приложении здесь будет отправка через web-push
    console.log("Sending notifications to", userSubscriptions.length, "subscriptions")
    console.log("Notification payload:", notificationPayload)

    // Симулируем успешную отправку
    const results = userSubscriptions.map((sub) => ({
      success: true,
      endpoint: sub.subscription.endpoint,
    }))

    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log(`Notifications sent: ${successful} successful, ${failed} failed`)

    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      results,
    })
  } catch (error) {
    console.error("Send notification error:", error)
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 })
  }
}
