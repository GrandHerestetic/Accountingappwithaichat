"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { listMyNotifications } from "@/lib/api"
import type { Notification, PaginatedResponse } from "@/lib/api/types"

const POLL_INTERVAL_MS = 30_000

/**
 * Polls GET /api/v1/my/notifications?unread_only=true every 30 seconds
 * while the browser tab is visible. Stops polling when the tab is hidden.
 *
 * Returns the current unread count so it can be displayed in the nav badge.
 */
export function useNotificationsPolling() {
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchUnread = useCallback(async () => {
    try {
      const data = await listMyNotifications({
        unreadOnly: true,
        page: 1,
        pageSize: 1,
      })
      setUnreadCount(data.total)
    } catch {
      // Silently ignore polling errors — badge will just stay stale
    }
  }, [])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return // already running
    fetchUnread()
    intervalRef.current = setInterval(fetchUnread, POLL_INTERVAL_MS)
  }, [fetchUnread])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    // Start immediately if tab is visible
    if (document.visibilityState === "visible") {
      startPolling()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPolling()
      } else {
        stopPolling()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      stopPolling()
    }
  }, [startPolling, stopPolling])

  return { unreadCount }
}
