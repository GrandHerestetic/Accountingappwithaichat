"use client"

import { useState, useEffect, useRef } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { apiRequest } from "@/lib/api-client"
import type { ChatMessage } from "@/lib/api/types"

interface UseChatOptions {
  chatId: string
  userId: string
}

export function useChat({ chatId, userId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Subscribe to chats/{chatId}/messages ordered by created_at ASC
    const messagesRef = collection(db, "chats", chatId, "messages")
    const q = query(messagesRef, orderBy("created_at", "asc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data()
            setMessages((prev) => [
              ...prev,
              {
                id: change.doc.id,
                chat_id: chatId,
                sender_id: data.sender_id,
                content: data.content,
                created_at:
                  data.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
                is_read: data.is_read ?? false,
              },
            ])
          }
        })
        setIsConnected(true)
        // Clear fallback polling if Firestore reconnects
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      },
      (err) => {
        console.error("Firestore listener error:", err)
        setError(err)
        setIsConnected(false)
        // Fallback: poll every 5 seconds
        pollingRef.current = setInterval(async () => {
          try {
            const data = await apiRequest<{ items: ChatMessage[] }>(
              `/api/v1/my/chats/${chatId}/messages?page=1&page_size=50`
            )
            setMessages(data.items)
          } catch {
            // Silently ignore polling errors
          }
        }, 5000)
      }
    )

    return () => {
      unsubscribe()
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [chatId])

  const sendMessage = async (content: string) => {
    if (content.length < 1 || content.length > 2000) {
      throw new Error("Message must be 1-2000 characters")
    }

    // Optimistic update
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
      await addDoc(collection(db, "chats", chatId, "messages"), {
        sender_id: userId,
        content,
        created_at: serverTimestamp(),
        is_read: false,
      })
      // Remove optimistic message — Firestore onSnapshot will add the real one
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      throw err
    }

    // Delete typing indicator on send
    await deleteDoc(doc(db, "chats", chatId, "typing", userId)).catch(() => {})
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
  }

  const handleTyping = async () => {
    await setDoc(doc(db, "chats", chatId, "typing", userId), {
      timestamp: serverTimestamp(),
    }).catch(() => {})

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(async () => {
      await deleteDoc(doc(db, "chats", chatId, "typing", userId)).catch(() => {})
    }, 3000)
  }

  return { messages, sendMessage, handleTyping, isConnected, error }
}
