import { type NextRequest, NextResponse } from "next/server"
const subscriptions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 })
    }

    const deleted = subscriptions.delete(endpoint)

    console.log(`Subscription ${deleted ? "removed" : "not found"} for endpoint:`, endpoint)

    return NextResponse.json({
      success: true,
      message: deleted ? "Subscription removed successfully" : "Subscription not found",
    })
  } catch (error) {
    console.error("Unsubscribe API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
