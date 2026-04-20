import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, tag, timestamp } = body

    console.log("Notification analytics:", {
      action,
      tag,
      timestamp,
      userAgent: request.headers.get("user-agent"),
    })

    return NextResponse.json({
      success: true,
      message: "Analytics recorded successfully",
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to record analytics" }, { status: 500 })
  }
}
