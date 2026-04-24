import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const mockNewMessages = []

    console.log("Chat sync requested")

    return NextResponse.json({
      success: true,
      newMessages: mockNewMessages,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Chat sync error:", error)
    return NextResponse.json({ error: "Failed to sync messages" }, { status: 500 })
  }
}
