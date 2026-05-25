"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  deleteChatMessage,
  listChatMessages,
  sendChatMessage,
  updateChatMessage,
} from "@/lib/api"
import type { ChatMessage } from "@/lib/api/types"

interface UseChatOptions {
  chatId: string
  userId: string
}

const POLL_MS = 4000
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
    if (!chatId || !UUID_RE.test(chatId)) return
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

  const sendMessage = async (content: string, attachmentIds?: string[]) => {
    if (!chatId || !UUID_RE.test(chatId)) {
      throw new Error("Чат недоступен")
    }
    const text = content.trim()
    if (!text && !attachmentIds?.length) {
      throw new Error("Введите текст или прикрепите файл")
    }
    if (text.length > 2000) {
      throw new Error("Сообщение не более 2000 символов")
    }

    const tempId = `temp-${Date.now()}`
    const tempMsg: ChatMessage = {
      id: tempId,
      chat_id: chatId,
      sender_id: userId,
      content: text || "📎 Вложение",
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      const msg = await sendChatMessage(
        chatId,
        {
          ...(text ? { text } : {}),
          ...(attachmentIds?.length ? { attachment_ids: attachmentIds } : {}),
        },
        userId
      )
      setMessages((prev) => [...prev.filter((m) => m.id !== tempId), msg])
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      throw err
    }
  }

  const editMessage = async (messageId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed || trimmed.length > 2000) {
      throw new Error("Текст сообщения: 1–2000 символов")
    }
    const msg = await updateChatMessage(chatId, messageId, trimmed, userId)
    setMessages((prev) => prev.map((m) => (m.id === messageId ? msg : m)))
    return msg
  }

  const removeMessage = async (messageId: string) => {
    await deleteChatMessage(chatId, messageId)
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: "Сообщение удалено",
              deleted_at: new Date().toISOString(),
            }
          : m
      )
    )
  }

  const handleTyping = async () => {
    // Backend has no typing endpoint; no-op
  }

  return {
    messages,
    sendMessage,
    editMessage,
    removeMessage,
    handleTyping,
    isConnected,
    error,
    reload: loadMessages,
  }
}
