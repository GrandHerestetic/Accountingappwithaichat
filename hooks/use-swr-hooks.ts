"use client"

/**
 * SWR-based data hooks for all dashboard and list pages.
 *
 * Requirements: 18.1, 18.2
 * - dedupingInterval: 5 * 60 * 1000 (5 min) for user profile and courses catalog
 * - revalidateOnFocus: true for all hooks
 */

import useSWR from "swr"
import {
  getMe,
  listAdminExecutorLeads,
  listAdminSanctions,
  listCoachCourses,
  listCourses,
  listMyCourseAssignments,
  listMyNotifications,
  listMyOrders,
  listMyResponses,
  listOrders,
  getMyWallet,
} from "@/lib/api"
import type {
  Order,
  OrderResponse,
  Notification,
  Course,
  CourseAssignment,
  UserProfile,
  PaginatedResponse,
  ExecutorLeadView,
  Sanction,
  WalletResponse,
} from "@/lib/api/types"

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
    ["orders", searchParams.toString()],
    () =>
      listOrders({
        page: params?.page,
        pageSize: params?.pageSize,
        category: params?.category,
        budgetMin: params?.budgetMin,
        budgetMax: params?.budgetMax,
        q: params?.q,
      }),
    { revalidateOnFocus: true }
  )
}

// ─── My Orders (client dashboard) ────────────────────────────────────────────
export function useMyOrders(params?: { page?: number; pageSize?: number }) {
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("page_size", String(params?.pageSize ?? 20))

  return useSWR<PaginatedResponse<Order>>(
    ["my-orders", searchParams.toString()],
    () => listMyOrders({ page: params?.page, pageSize: params?.pageSize }),
    { revalidateOnFocus: true }
  )
}

// ─── My Responses (executor dashboard) ───────────────────────────────────────
export function useMyResponses(params?: { page?: number; pageSize?: number }) {
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("page_size", String(params?.pageSize ?? 20))

  return useSWR<PaginatedResponse<OrderResponse>>(
    ["my-responses", searchParams.toString()],
    () => listMyResponses({ page: params?.page, pageSize: params?.pageSize }),
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
    ["notifications", searchParams.toString()],
    () =>
      listMyNotifications({
        page: params?.page,
        pageSize: params?.pageSize,
        unreadOnly: params?.unreadOnly,
        status: params?.status,
        type: params?.type,
      }),
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
    ["courses", searchParams.toString()],
    () => listCourses({ page: params?.page, pageSize: params?.pageSize }),
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
    ["course-assignments", searchParams.toString()],
    () =>
      listMyCourseAssignments({
        page: params?.page,
        pageSize: params?.pageSize,
        status: params?.status,
      }),
    { revalidateOnFocus: true }
  )
}

// ─── User Profile ─────────────────────────────────────────────────────────────
// dedupingInterval: 5 min (Req 18.1 — user profile and courses catalog)
export function useUserProfile() {
  return useSWR<UserProfile>("auth-me", getMe, {
    revalidateOnFocus: true,
    dedupingInterval: 5 * 60 * 1000,
  })
}

export function useCoachCourses(params?: { page?: number; pageSize?: number }) {
  const key = `coach-courses-${params?.page ?? 1}-${params?.pageSize ?? 20}`
  return useSWR<PaginatedResponse<Course>>(key, () => listCoachCourses(params), {
    revalidateOnFocus: true,
  })
}

export function useAdminExecutorLeads(params?: { page?: number; pageSize?: number; status?: string }) {
  const key = `admin-leads-${params?.page ?? 1}-${params?.status ?? "all"}`
  return useSWR<PaginatedResponse<ExecutorLeadView>>(key, () => listAdminExecutorLeads(params), {
    revalidateOnFocus: true,
  })
}

export function useAdminSanctions(params?: { page?: number; pageSize?: number }) {
  const key = `admin-sanctions-${params?.page ?? 1}`
  return useSWR<PaginatedResponse<Sanction>>(key, () => listAdminSanctions(params), {
    revalidateOnFocus: true,
  })
}

export function useMyWallet() {
  return useSWR<WalletResponse>("my-wallet", getMyWallet, { revalidateOnFocus: true })
}
