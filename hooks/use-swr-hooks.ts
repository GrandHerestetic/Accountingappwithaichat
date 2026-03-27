"use client"

/**
 * SWR-based data hooks for all dashboard and list pages.
 *
 * Requirements: 18.1, 18.2
 * - dedupingInterval: 5 * 60 * 1000 (5 min) for user profile and courses catalog
 * - revalidateOnFocus: true for all hooks
 */

import useSWR from "swr"
import { apiRequest } from "@/lib/api-client"
import type {
  Order,
  OrderResponse,
  Notification,
  Course,
  CourseAssignment,
  UserProfile,
  PaginatedResponse,
} from "@/lib/api/types"

// ─── Generic fetcher ─────────────────────────────────────────────────────────
const fetcher = <T>(url: string) => apiRequest<T>(url)

// ─── Orders (public feed) ─────────────────────────────────────────────────────
export function useOrders(params?: {
  page?: number
  pageSize?: number
  category?: string
  budgetMin?: number
  budgetMax?: number
  q?: string
}) {
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("page_size", String(params?.pageSize ?? 20))
  if (params?.category) searchParams.set("category", params.category)
  if (params?.budgetMin != null) searchParams.set("budget_min", String(params.budgetMin))
  if (params?.budgetMax != null) searchParams.set("budget_max", String(params.budgetMax))
  if (params?.q) searchParams.set("q", params.q)

  return useSWR<PaginatedResponse<Order>>(
    `/api/v1/orders?${searchParams.toString()}`,
    fetcher,
    { revalidateOnFocus: true }
  )
}

// ─── My Orders (client dashboard) ────────────────────────────────────────────
export function useMyOrders(params?: { page?: number; pageSize?: number }) {
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("page_size", String(params?.pageSize ?? 20))

  return useSWR<PaginatedResponse<Order>>(
    `/api/v1/orders/my?${searchParams.toString()}`,
    fetcher,
    { revalidateOnFocus: true }
  )
}

// ─── My Responses (executor dashboard) ───────────────────────────────────────
export function useMyResponses(params?: { page?: number; pageSize?: number }) {
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("page_size", String(params?.pageSize ?? 20))

  return useSWR<PaginatedResponse<OrderResponse>>(
    `/api/v1/my/responses?${searchParams.toString()}`,
    fetcher,
    { revalidateOnFocus: true }
  )
}

// ─── Notifications ────────────────────────────────────────────────────────────
export function useNotifications(params?: {
  page?: number
  pageSize?: number
  unreadOnly?: boolean
  status?: string
  type?: string
}) {
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("page_size", String(params?.pageSize ?? 20))
  if (params?.unreadOnly) searchParams.set("unread_only", "true")
  if (params?.status) searchParams.set("status", params.status)
  if (params?.type) searchParams.set("type", params.type)

  return useSWR<PaginatedResponse<Notification>>(
    `/api/v1/my/notifications?${searchParams.toString()}`,
    fetcher,
    { revalidateOnFocus: true }
  )
}

// ─── Courses catalog ──────────────────────────────────────────────────────────
// dedupingInterval: 5 min (Req 18.1 — user profile and courses catalog)
export function useCourses(params?: { page?: number; pageSize?: number }) {
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("page_size", String(params?.pageSize ?? 20))

  return useSWR<PaginatedResponse<Course>>(
    `/api/v1/courses?${searchParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5 * 60 * 1000,
    }
  )
}

// ─── Course Assignments (executor) ───────────────────────────────────────────
export function useCourseAssignments(params?: {
  page?: number
  pageSize?: number
  status?: string
}) {
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("page_size", String(params?.pageSize ?? 20))
  if (params?.status) searchParams.set("status", params.status)

  return useSWR<PaginatedResponse<CourseAssignment>>(
    `/api/v1/my/course-assignments?${searchParams.toString()}`,
    fetcher,
    { revalidateOnFocus: true }
  )
}

// ─── User Profile ─────────────────────────────────────────────────────────────
// dedupingInterval: 5 min (Req 18.1 — user profile and courses catalog)
export function useUserProfile() {
  return useSWR<UserProfile>(
    "/api/v1/auth/me",
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5 * 60 * 1000,
    }
  )
}
