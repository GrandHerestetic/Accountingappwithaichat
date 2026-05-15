"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { listChatMessages, sendChatMessage } from "@/lib/api"
import type { ChatMessage } from "@/lib/api/types"

interface UseChatOptions {
  chatId: string
  userId: string
}

const POLL_MS = 4000

export function useChat({ chatId, userId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadMessages = useCallback(async () => {
    const data = await listChatMessages(chatId, { page: 1, pageSize: 50 }, userId)
    setMessages(data.items)
    setIsConnected(true)
    setError(null)
  }, [chatId, userId])

  useEffect(() => {
    if (!chatId) return
    let cancelled = false

    const tick = async () => {
      try {
        const data = await listChatMessages(chatId, { page: 1, pageSize: 50 }, userId)
        if (!cancelled) {
          setMessages(data.items)
          setIsConnected(true)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setIsConnected(false)
          setError(err instanceof Error ? err : new Error("Failed to load messages"))
        }
      }
    }

    tick()
    pollingRef.current = setInterval(tick, POLL_MS)

    return () => {
      cancelled = true
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [chatId, userId])

  const sendMessage = async (content: string) => {
    if (content.length < 1 || content.length > 2000) {
      throw new Error("Message must be 1-2000 characters")
    }

    const tempId = `temp-${Date.now()}`
    const tempMsg: ChatMessage = {
      id: tempId,
      chat_id: chatId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      const msg = await sendChatMessage(chatId, content)
      setMessages((prev) => [...prev.filter((m) => m.id !== tempId), msg])
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      throw err
    }
  }

  const handleTyping = async () => {
    // Backend has no typing endpoint; no-op
  }

  return { messages, sendMessage, handleTyping, isConnected, error, reload: loadMessages }
}
