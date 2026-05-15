import { apiFormRequest, apiRequest } from "@/lib/api-client"
import { normalizeChatSummary, normalizeMeResponse, normalizeMessage } from "./normalize"
import type {
  Chat,
  ChatDetail,
  Course,
  CourseAssignment,
  CourseMaterial,
  CreateCourseRequest,
  CreateOrderRequest,
  CreateReviewRequest,
  AttachmentTargetType,
  AttachmentView,
  ExecutorLeadSubmittedResponse,
  ExecutorLeadView,
  MeResponse,
  UploadView,
  Notification,
  Order,
  OrderDetailsResponse,
  OrderResponse,
  PaginatedResponse,
  ProfileResponse,
  RatingInfo,
  Review,
  Sanction,
  Selection,
  UpdateOrderRequest,
  UpdateProfileRequest,
  UpdateResponseRequest,
  UserProfile,
} from "./types"

export type ListParams = {
  page?: number
  pageSize?: number
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ""
}

// ─── Auth & profile ───────────────────────────────────────────────────────────

export async function getMe(): Promise<UserProfile> {
  const data = await apiRequest<MeResponse>("/api/v1/auth/me")
  return normalizeMeResponse(data)
}

export async function getProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/api/v1/profile")
}

export async function updateProfile(body: UpdateProfileRequest): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/api/v1/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function listOrders(params?: ListParams & {
  category?: string
  budgetMin?: number
  budgetMax?: number
  q?: string
  status?: string
}): Promise<PaginatedResponse<Order>> {
  return apiRequest(
    `/api/v1/orders${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      category: params?.category,
      budget_min: params?.budgetMin,
      budget_max: params?.budgetMax,
      q: params?.q,
      status: params?.status,
    })}`
  )
}

export async function listMyOrders(params?: ListParams): Promise<PaginatedResponse<Order>> {
  return apiRequest(
    `/api/v1/orders/my${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

export async function getOrder(id: string): Promise<Order> {
  return apiRequest<Order>(`/api/v1/orders/${id}`)
}

export async function getMyOrderDetails(id: string): Promise<OrderDetailsResponse> {
  return apiRequest<OrderDetailsResponse>(`/api/v1/orders/my/${id}`)
}

export async function createOrder(body: CreateOrderRequest): Promise<Order> {
  return apiRequest<Order>("/api/v1/orders", { method: "POST", body: JSON.stringify(body) })
}

export async function updateMyOrder(id: string, body: UpdateOrderRequest): Promise<Order> {
  return apiRequest<Order>(`/api/v1/orders/my/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function submitMyOrder(id: string): Promise<{ checkout_url?: string }> {
  return apiRequest(`/api/v1/orders/my/${id}/submit`, { method: "POST" })
}

export async function cancelMyOrder(id: string): Promise<void> {
  return apiRequest(`/api/v1/orders/my/${id}/cancel`, { method: "POST" })
}

// ─── Client order lifecycle ───────────────────────────────────────────────────

export async function listClientOrderResponses(orderId: string): Promise<PaginatedResponse<OrderResponse>> {
  return apiRequest(`/api/v1/client/orders/${orderId}/responses`)
}

export async function selectClientResponse(orderId: string, responseId: string): Promise<void> {
  return apiRequest(`/api/v1/client/orders/${orderId}/select-response/${responseId}`, { method: "POST" })
}

export async function getClientSelection(orderId: string): Promise<Selection> {
  return apiRequest(`/api/v1/client/orders/${orderId}/selection`)
}

export async function completeClientOrder(orderId: string): Promise<void> {
  return apiRequest(`/api/v1/client/orders/${orderId}/complete`, { method: "POST" })
}

export async function reopenClientOrder(orderId: string): Promise<void> {
  return apiRequest(`/api/v1/client/orders/${orderId}/reopen`, { method: "POST" })
}

export async function getClientOrderReview(orderId: string): Promise<Review | null> {
  try {
    return await apiRequest<Review>(`/api/v1/client/orders/${orderId}/review`)
  } catch {
    return null
  }
}

export async function createClientOrderReview(orderId: string, body: CreateReviewRequest): Promise<Review> {
  return apiRequest(`/api/v1/client/orders/${orderId}/review`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

// ─── Executor responses ───────────────────────────────────────────────────────

export async function listMyResponses(params?: ListParams): Promise<PaginatedResponse<OrderResponse>> {
  return apiRequest(
    `/api/v1/my/responses${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

export async function createOrderResponse(
  orderId: string,
  body: { proposed_amount: number; proposed_deadline: string; cover_letter: string }
): Promise<{ id: string; status: string }> {
  return apiRequest(`/api/v1/orders/${orderId}/responses`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateMyResponse(
  orderId: string,
  responseId: string,
  body: UpdateResponseRequest
): Promise<OrderResponse> {
  return apiRequest(`/api/v1/orders/${orderId}/responses/my/${responseId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function submitMyResponse(
  orderId: string,
  responseId: string
): Promise<{ checkout_url?: string }> {
  return apiRequest(`/api/v1/orders/${orderId}/responses/my/${responseId}/submit`, { method: "POST" })
}

export async function cancelMyResponse(orderId: string, responseId: string): Promise<void> {
  return apiRequest(`/api/v1/orders/${orderId}/responses/my/${responseId}/cancel`, { method: "POST" })
}

export async function getExecutorRating(executorId: string): Promise<RatingInfo> {
  return apiRequest(`/api/v1/executors/${executorId}/rating`)
}

export async function getExecutorReviews(
  executorId: string,
  params?: ListParams
): Promise<PaginatedResponse<Review>> {
  return apiRequest(
    `/api/v1/executors/${executorId}/reviews${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
    })}`
  )
}

export async function listMySanctions(params?: ListParams): Promise<PaginatedResponse<Sanction>> {
  return apiRequest(
    `/api/v1/my/sanctions${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

// ─── Files & attachments ──────────────────────────────────────────────────────

function parseUploadList(data: { items?: UploadView[] } | UploadView[]): UploadView[] {
  if (Array.isArray(data)) return data
  return data.items ?? []
}

export async function uploadFiles(files: File[]): Promise<UploadView[]> {
  if (!files.length) return []
  const formData = new FormData()
  for (const file of files) {
    formData.append("file", file)
  }
  const data = await apiFormRequest<{ items: UploadView[] } | UploadView[]>(
    "/api/v1/files",
    formData
  )
  return parseUploadList(data)
}

export async function listMyFiles(): Promise<UploadView[]> {
  const data = await apiRequest<{ items: UploadView[] }>("/api/v1/my/files")
  return data.items ?? (data as unknown as UploadView[])
}

export async function attachFiles(
  targetType: AttachmentTargetType,
  targetId: string,
  uploadIds: string[]
): Promise<AttachmentView[]> {
  if (!uploadIds.length) return []
  const data = await apiRequest<{ items: AttachmentView[] }>("/api/v1/attachments", {
    method: "POST",
    body: JSON.stringify({
      target_type: targetType,
      target_id: targetId,
      upload_ids: uploadIds,
    }),
  })
  return data.items ?? []
}

export async function listAttachments(
  targetType: AttachmentTargetType,
  targetId: string
): Promise<AttachmentView[]> {
  const data = await apiRequest<{ items: AttachmentView[] }>(
    `/api/v1/attachments${qs({ target_type: targetType, target_id: targetId })}`
  )
  return data.items ?? []
}

export async function uploadAndAttach(
  files: File[],
  targetType: AttachmentTargetType,
  targetId: string
): Promise<UploadView[]> {
  const uploads = await uploadFiles(files)
  if (uploads.length) {
    await attachFiles(
      targetType,
      targetId,
      uploads.map((u) => u.id)
    )
  }
  return uploads
}

export async function submitExecutorLead(
  formData: FormData
): Promise<ExecutorLeadSubmittedResponse> {
  return apiFormRequest<ExecutorLeadSubmittedResponse>("/api/v1/leads/executor", formData)
}

// ─── Chats ────────────────────────────────────────────────────────────────────

export async function listMyChats(params?: ListParams): Promise<PaginatedResponse<Chat>> {
  const data = await apiRequest<PaginatedResponse<Parameters<typeof normalizeChatSummary>[0]>>(
    `/api/v1/my/chats${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
  return { ...data, items: data.items.map(normalizeChatSummary) }
}

export async function getMyChat(chatId: string): Promise<ChatDetail> {
  return apiRequest<ChatDetail>(`/api/v1/my/chats/${chatId}`)
}

export async function listChatMessages(
  chatId: string,
  params?: ListParams,
  currentUserId?: string
): Promise<PaginatedResponse<import("./types").ChatMessage>> {
  const data = await apiRequest<PaginatedResponse<import("./types").Message>>(
    `/api/v1/my/chats/${chatId}/messages${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 50,
    })}`
  )
  return {
    ...data,
    items: data.items.map((m) => normalizeMessage(m, currentUserId)),
  }
}

export async function sendChatMessage(chatId: string, text: string): Promise<import("./types").ChatMessage> {
  const msg = await apiRequest<import("./types").Message>(`/api/v1/my/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  })
  return normalizeMessage(msg)
}

export async function markChatRead(chatId: string): Promise<void> {
  return apiRequest(`/api/v1/my/chats/${chatId}/read`, { method: "POST" })
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function listMyNotifications(params?: ListParams & {
  unreadOnly?: boolean
  status?: string
  type?: string
}): Promise<PaginatedResponse<Notification>> {
  return apiRequest(
    `/api/v1/my/notifications${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      unread_only: params?.unreadOnly ? "true" : undefined,
      status: params?.status,
      type: params?.type,
    })}`
  )
}

export async function markNotificationRead(id: string): Promise<void> {
  return apiRequest(`/api/v1/my/notifications/${id}/read`, { method: "POST" })
}

export async function markAllNotificationsRead(): Promise<void> {
  return apiRequest("/api/v1/my/notifications/read-all", { method: "POST" })
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function listCourses(params?: ListParams): Promise<PaginatedResponse<Course>> {
  return apiRequest(
    `/api/v1/courses${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

export async function getCourse(id: string): Promise<Course> {
  return apiRequest<Course>(`/api/v1/courses/${id}`)
}

export async function getCourseMaterials(id: string): Promise<CourseMaterial[]> {
  return apiRequest<CourseMaterial[]>(`/api/v1/courses/${id}/materials`)
}

export async function listCoachCourses(params?: ListParams): Promise<PaginatedResponse<Course>> {
  return apiRequest(
    `/api/v1/coach/courses${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

export async function createCoachCourse(body: CreateCourseRequest): Promise<Course> {
  return apiRequest<Course>("/api/v1/coach/courses", { method: "POST", body: JSON.stringify(body) })
}

export async function createCoachCourseMaterial(
  courseId: string,
  body: { title: string; type: "video" | "pdf" | "link" | "text"; url?: string; content?: string }
): Promise<CourseMaterial> {
  return apiRequest<CourseMaterial>(`/api/v1/coach/courses/${courseId}/materials`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function publishCoachCourse(id: string): Promise<Course> {
  return apiRequest<Course>(`/api/v1/coach/courses/${id}/publish`, { method: "POST" })
}

export async function listMyCourseAssignments(params?: ListParams & {
  status?: string
}): Promise<PaginatedResponse<CourseAssignment>> {
  return apiRequest(
    `/api/v1/my/course-assignments${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      status: params?.status,
    })}`
  )
}

export async function markCourseAssignmentCompleted(id: string): Promise<void> {
  return apiRequest(`/api/v1/my/course-assignments/${id}/mark-completed`, { method: "POST" })
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function listAdminExecutorLeads(params?: ListParams & {
  status?: string
}): Promise<PaginatedResponse<ExecutorLeadView>> {
  return apiRequest(
    `/api/v1/admin/executor-leads${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      status: params?.status,
    })}`
  )
}

export async function approveExecutorLead(id: string, notes?: string): Promise<{ user_id: string }> {
  return apiRequest(`/api/v1/admin/executor-leads/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ notes: notes ?? "" }),
  })
}

export async function rejectExecutorLead(id: string, reason?: string): Promise<void> {
  return apiRequest(`/api/v1/admin/executor-leads/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason: reason ?? "" }),
  })
}

export async function listAdminSanctions(params?: ListParams): Promise<PaginatedResponse<Sanction>> {
  return apiRequest(
    `/api/v1/admin/sanctions${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

export async function liftAdminSanction(id: string): Promise<void> {
  return apiRequest(`/api/v1/admin/sanctions/${id}/lift`, { method: "POST" })
}

export async function listAdminChats(params?: ListParams): Promise<PaginatedResponse<Chat>> {
  const data = await apiRequest<PaginatedResponse<Parameters<typeof normalizeChatSummary>[0]>>(
    `/api/v1/admin/chats${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
  return { ...data, items: data.items.map(normalizeChatSummary) }
}

export async function listAdminNotifications(params?: ListParams): Promise<PaginatedResponse<Notification>> {
  return apiRequest(
    `/api/v1/admin/notifications${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

export async function pingApi(): Promise<{ status: string }> {
  return apiRequest("/api/v1/ping")
}

export async function healthCheck(): Promise<{ status: string }> {
  return apiRequest("/healthz")
}
