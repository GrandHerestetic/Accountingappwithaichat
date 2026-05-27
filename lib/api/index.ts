import { apiFormRequest, apiRequest } from "@/lib/api-client"
import { serializeProfilePatch, type ProfilePatchInput, type ProfileRole } from "@/lib/profile-patch"
import { normalizeChatSummary, normalizeChatDetail, normalizeMeResponse, normalizeMessage } from "./normalize"
import type {
  Chat,
  ChatDetail,
  Course,
  CourseAssignment,
  CourseDetailResponse,
  CourseMaterial,
  CreateAssignmentRequest,
  CreateCourseRequest,
  CreateEntityReviewRequest,
  CreateOrderRequest,
  CreateReviewRequest,
  MyReview,
  UpdateReviewRequest,
  AttachmentTargetType,
  AttachmentView,
  EntityRatingSummary,
  EntityReview,
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
  ReviewTargetType,
  ReorderAttachmentsRequest,
  Sanction,
  Selection,
  UpdateCourseRequest,
  UpdateOrderRequest,
  UpdateProfileRequest,
  UpdateResponseRequest,
  UserProfile,
  StorageUploadResponse,
} from "./types"
import { ApiError } from "./types"

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

export async function updateProfile(
  body: ProfilePatchInput | UpdateProfileRequest,
  role?: ProfileRole
): Promise<ProfileResponse> {
  const payload = serializeProfilePatch(body as ProfilePatchInput, role)
  if (Object.keys(payload).length === 0) {
    return getProfile()
  }
  return apiRequest<ProfileResponse>("/api/v1/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

/** POST /api/v1/files — загрузка файла в хранилище. */
export async function uploadFile(file: File): Promise<UploadView> {
  const formData = new FormData()
  formData.append("file", file)
  const data = await apiFormRequest<{ items: UploadView[] } | UploadView[]>("/api/v1/files", formData)
  const items = parseUploadList(data)
  const first = items[0]
  if (!first?.id) {
    throw new ApiError("Сервер не вернул идентификатор загруженного файла", 500, "invalid_upload")
  }
  return first
}

/** Загрузка файла + привязка как аватар профиля (PATCH /api/v1/profile/avatar). */
export async function uploadProfileAvatar(file: File): Promise<ProfileResponse> {
  const uploaded = await uploadFile(file)
  return apiRequest<ProfileResponse>("/api/v1/profile/avatar", {
    method: "PATCH",
    body: JSON.stringify({ upload_id: uploaded.id }),
  })
}

export async function clearProfileAvatar(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/api/v1/profile/avatar", { method: "DELETE" })
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
  const data = await apiRequest<PaginatedResponse<Order>>(
    `/api/v1/orders/my${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    page: data?.page ?? params?.page ?? 1,
    page_size: data?.page_size ?? params?.pageSize ?? 20,
    total: data?.total ?? 0,
  }
}

export async function getOrder(id: string): Promise<Order> {
  return apiRequest<Order>(`/api/v1/orders/${id}`)
}

export async function getMyOrderDetails(id: string): Promise<OrderDetailsResponse> {
  return apiRequest<OrderDetailsResponse>(`/api/v1/orders/my/${id}`)
}

function toISODeadline(deadline: string): string {
  const trimmed = deadline.trim()
  if (!trimmed) return trimmed
  if (trimmed.includes("T")) return trimmed
  return `${trimmed}T12:00:00.000Z`
}

export async function createOrder(body: CreateOrderRequest): Promise<Order> {
  const payload = { ...body, currency: body.currency ?? "KZT" }
  if (payload.deadline_at) {
    payload.deadline_at = toISODeadline(payload.deadline_at)
  }
  return apiRequest<Order>("/api/v1/orders", { method: "POST", body: JSON.stringify(payload) })
}

export async function updateMyOrder(id: string, body: UpdateOrderRequest): Promise<Order> {
  const payload = { ...body }
  if (payload.deadline_at) {
    payload.deadline_at = toISODeadline(payload.deadline_at)
  }
  return apiRequest<Order>(`/api/v1/orders/my/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function submitMyOrder(id: string): Promise<void> {
  await apiRequest(`/api/v1/orders/my/${id}/submit`, { method: "POST" })
}

export async function cancelMyOrder(id: string): Promise<void> {
  return apiRequest(`/api/v1/orders/my/${id}/cancel`, { method: "POST" })
}

export async function deleteMyOrder(id: string): Promise<void> {
  return apiRequest(`/api/v1/orders/my/${id}`, { method: "DELETE" })
}

export async function getMyOrderResponse(
  orderId: string,
  responseId: string
): Promise<OrderResponse> {
  return apiRequest(`/api/v1/orders/${orderId}/responses/my/${responseId}`)
}

export async function listMyOrderResponses(orderId: string): Promise<PaginatedResponse<OrderResponse>> {
  return apiRequest(`/api/v1/orders/${orderId}/responses/my`)
}

// ─── Client order lifecycle ───────────────────────────────────────────────────

export async function listClientOrderResponses(orderId: string): Promise<PaginatedResponse<OrderResponse>> {
  return apiRequest(`/api/v1/client/orders/${orderId}/responses`)
}

export async function getClientOrderResponse(
  orderId: string,
  responseId: string
): Promise<OrderResponse> {
  return apiRequest(`/api/v1/client/orders/${orderId}/responses/${responseId}`)
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

// ─── My reviews (authored CRUD) ─────────────────────────────────────────────

export async function listMyReviews(params?: ListParams): Promise<PaginatedResponse<MyReview>> {
  return apiRequest(
    `/api/v1/my/reviews${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

export async function getMyReview(reviewId: string): Promise<MyReview> {
  return apiRequest<MyReview>(`/api/v1/my/reviews/${reviewId}`)
}

export async function updateMyReview(reviewId: string, body: UpdateReviewRequest): Promise<MyReview> {
  return apiRequest<MyReview>(`/api/v1/my/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function deleteMyReview(reviewId: string): Promise<MyReview> {
  return apiRequest<MyReview>(`/api/v1/my/reviews/${reviewId}`, { method: "DELETE" })
}

export async function getMyCourseReview(courseId: string): Promise<MyReview | null> {
  const data = await listMyReviews({ page: 1, pageSize: 100 })
  return (
    data.items.find(
      (item) =>
        item.source === "entity" && item.target_type === "course" && item.target_id === courseId
    ) ?? null
  )
}

// ─── Executor responses ───────────────────────────────────────────────────────

export async function listMyResponses(params?: ListParams): Promise<PaginatedResponse<OrderResponse>> {
  return apiRequest(
    `/api/v1/my/responses${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

function buildResponsePayload(body: {
  proposed_amount: number
  cover_letter: string
  currency?: string
  proposed_deadline?: string
}) {
  let coverLetter = body.cover_letter.trim()
  if (body.proposed_deadline?.trim()) {
    const deadlineLabel = body.proposed_deadline.includes("T")
      ? new Date(body.proposed_deadline).toLocaleDateString("ru-RU")
      : body.proposed_deadline
    coverLetter = `${coverLetter}\n\nПредлагаемый срок: ${deadlineLabel}`
  }
  return {
    proposed_amount: body.proposed_amount,
    cover_letter: coverLetter,
    currency: body.currency ?? "KZT",
  }
}

export async function createOrderResponse(
  orderId: string,
  body: { proposed_amount: number; cover_letter: string; currency?: string; proposed_deadline?: string }
): Promise<{ id: string; status: string }> {
  const res = await apiRequest<{ id: string; status: string }>(`/api/v1/orders/${orderId}/responses`, {
    method: "POST",
    body: JSON.stringify(buildResponsePayload(body)),
  })
  if (!res?.id) {
    throw new ApiError("Сервер не вернул идентификатор отклика", 500, "invalid_response")
  }
  return { id: res.id, status: res.status }
}

export async function saveOrderResponseDraft(
  orderId: string,
  body: { proposed_amount: number; cover_letter: string; currency?: string; proposed_deadline?: string },
  existingResponseId?: string
): Promise<{ id: string; status: string }> {
  if (existingResponseId) {
    const updated = await updateMyResponse(orderId, existingResponseId, body)
    return { id: updated.id, status: updated.status }
  }

  try {
    return await createOrderResponse(orderId, body)
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      const existing = await listMyOrderResponses(orderId)
      const draft = existing.items.find(
        (item) => item.status === "draft" || item.status === "payment_pending"
      )
      if (!draft) throw err
      const updated = await updateMyResponse(orderId, draft.id, body)
      return { id: updated.id, status: updated.status }
    }
    throw err
  }
}

export async function updateMyResponse(
  orderId: string,
  responseId: string,
  body: UpdateResponseRequest
): Promise<OrderResponse> {
  const payload: Record<string, unknown> = {}

  if (body.proposed_amount !== undefined) {
    payload.proposed_amount = body.proposed_amount
  }
  if (body.currency !== undefined) {
    payload.currency = body.currency
  }
  if (body.cover_letter !== undefined) {
    let coverLetter = body.cover_letter.trim()
    if (body.proposed_deadline?.trim()) {
      const deadlineLabel = body.proposed_deadline.includes("T")
        ? new Date(body.proposed_deadline).toLocaleDateString("ru-RU")
        : body.proposed_deadline
      coverLetter = `${coverLetter}\n\nПредлагаемый срок: ${deadlineLabel}`
    }
    payload.cover_letter = coverLetter
  }

  return apiRequest(`/api/v1/orders/${orderId}/responses/my/${responseId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function submitMyResponse(orderId: string, responseId: string): Promise<void> {
  await apiRequest(`/api/v1/orders/${orderId}/responses/my/${responseId}/submit`, {
    method: "POST",
  })
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

export async function getMyResponse(responseId: string): Promise<OrderResponse> {
  return apiRequest(`/api/v1/my/responses/${responseId}`)
}

// ─── Generic reviews & ratings ──────────────────────────────────────────────

export async function listEntityReviews(
  targetType: ReviewTargetType,
  targetId: string,
  params?: ListParams
): Promise<PaginatedResponse<EntityReview>> {
  return apiRequest(
    `/api/v1/reviews${qs({
      target_type: targetType,
      target_id: targetId,
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
    })}`
  )
}

export async function createEntityReview(body: CreateEntityReviewRequest): Promise<EntityReview> {
  return apiRequest<EntityReview>("/api/v1/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function getEntityRating(
  targetType: ReviewTargetType,
  targetId: string
): Promise<EntityRatingSummary> {
  return apiRequest(
    `/api/v1/ratings${qs({ target_type: targetType, target_id: targetId })}`
  )
}

// ─── Files & attachments ──────────────────────────────────────────────────────

function parseUploadList(data: { items?: UploadView[] } | UploadView[]): UploadView[] {
  if (Array.isArray(data)) return data
  return data.items ?? []
}

export async function uploadFiles(files: File[]): Promise<UploadView[]> {
  if (!files.length) return []
  const results: UploadView[] = []
  for (const file of files) {
    results.push(await uploadFile(file))
  }
  return results
}

export async function listMyFiles(): Promise<UploadView[]> {
  const data = await apiRequest<{ items: UploadView[] }>("/api/v1/my/files")
  return data.items ?? (data as unknown as UploadView[])
}

export async function getFile(id: string): Promise<UploadView> {
  return apiRequest<UploadView>(`/api/v1/files/${id}`)
}

export async function deleteFile(id: string): Promise<void> {
  return apiRequest(`/api/v1/files/${id}`, { method: "DELETE" })
}

export async function attachFiles(
  targetType: AttachmentTargetType,
  targetId: string,
  uploadIds: string[],
  metadata?: Record<string, unknown>
): Promise<AttachmentView[]> {
  if (!uploadIds.length) return []
  const data = await apiRequest<{ items: AttachmentView[] }>("/api/v1/attachments", {
    method: "POST",
    body: JSON.stringify({
      target_type: targetType,
      target_id: targetId,
      upload_ids: uploadIds,
      ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
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

export async function deleteAttachment(id: string): Promise<void> {
  return apiRequest(`/api/v1/attachments/${id}`, { method: "DELETE" })
}

export async function reorderAttachments(ids: string[]): Promise<void> {
  await apiRequest("/api/v1/attachments/reorder", {
    method: "PATCH",
    body: JSON.stringify({ ids } satisfies ReorderAttachmentsRequest),
  })
}

export async function uploadAndAttach(
  files: File[],
  targetType: AttachmentTargetType,
  targetId: string,
  metadata?: Record<string, unknown>
): Promise<UploadView[]> {
  const uploads = await uploadFiles(files)
  if (uploads.length) {
    await attachFiles(
      targetType,
      targetId,
      uploads.map((u) => u.id),
      metadata
    )
  }
  return uploads
}

/** Загрузить файл и привязать к профилю с метаданными (портфолио / достижение). */
export async function attachProfileDocument(
  userId: string,
  file: File,
  metadata: Record<string, unknown>
): Promise<AttachmentView[]> {
  const uploads = await uploadFiles([file])
  const uploadId = uploads[0]?.id
  if (!uploadId) {
    throw new Error("Не удалось загрузить файл")
  }
  return attachFiles("profile_document", userId, [uploadId], metadata)
}

/** Public multipart registration for executors (diploma backend). */
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
  const data = await apiRequest<Record<string, unknown>>(`/api/v1/my/chats/${chatId}`)
  return normalizeChatDetail(data)
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

export async function sendChatMessage(
  chatId: string,
  body: import("./types").SendMessageRequest | string,
  currentUserId?: string
): Promise<import("./types").ChatMessage> {
  const payload =
    typeof body === "string"
      ? { text: body.trim(), attachment_ids: undefined as string[] | undefined }
      : {
          text: (body.text ?? "").trim(),
          attachment_ids: body.attachment_ids?.filter(Boolean),
        }
  if (!payload.text && !payload.attachment_ids?.length) {
    throw new ApiError("Введите текст или прикрепите файл", 400, "bad_request")
  }
  const msg = await apiRequest<import("./types").Message>(`/api/v1/my/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      text: payload.text,
      ...(payload.attachment_ids?.length ? { attachment_ids: payload.attachment_ids } : {}),
    }),
  })
  return normalizeMessage(msg, currentUserId)
}

/** Backend v2: редактирование сообщений не поддерживается */
export async function updateChatMessage(
  _chatId: string,
  _messageId: string,
  _text: string,
  _currentUserId?: string
): Promise<import("./types").ChatMessage> {
  throw new ApiError("Редактирование сообщений недоступно", 501, "not_implemented")
}

/** Backend v2: удаление сообщений не поддерживается */
export async function deleteChatMessage(_chatId: string, _messageId: string): Promise<void> {
  throw new ApiError("Удаление сообщений недоступно", 501, "not_implemented")
}

export async function markChatRead(chatId: string): Promise<void> {
  return apiRequest(`/api/v1/my/chats/${chatId}/read`, { method: "POST" })
}

// ─── Auth (public) ────────────────────────────────────────────────────────────

export async function login(body: import("./types").LoginRequest): Promise<import("./types").AuthResponse> {
  return apiRequest<import("./types").AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function register(
  body: import("./types").RegisterRequest
): Promise<import("./types").AuthResponse> {
  return apiRequest<import("./types").AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function logout(refreshToken: string | null): Promise<void> {
  await apiRequest<void>("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
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

export async function getMyNotification(id: string): Promise<Notification> {
  return apiRequest<Notification>(`/api/v1/my/notifications/${id}`)
}

export async function markNotificationRead(id: string): Promise<void> {
  return apiRequest(`/api/v1/my/notifications/${id}/read`, { method: "POST" })
}

export async function markAllNotificationsRead(): Promise<void> {
  return apiRequest("/api/v1/my/notifications/read-all", { method: "POST" })
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function listCourses(
  params?: ListParams & { status?: string }
): Promise<PaginatedResponse<Course>> {
  return apiRequest(
    `/api/v1/courses${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      status: params?.status,
    })}`
  )
}

export async function getCourseDetail(id: string): Promise<CourseDetailResponse> {
  return apiRequest<CourseDetailResponse>(`/api/v1/courses/${id}`)
}

export async function getCourse(id: string): Promise<Course> {
  const data = await getCourseDetail(id)
  return data.course
}

export async function getCoursesByIds(ids: string[]): Promise<Map<string, Course>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const detail = await getCourseDetail(id)
        return [id, detail.course] as const
      } catch {
        return null
      }
    })
  )
  return new Map(entries.filter((entry): entry is [string, Course] => entry !== null))
}

export async function getCourseMaterials(id: string): Promise<CourseMaterial[]> {
  const data = await getCourseDetail(id)
  return data.materials ?? []
}

export async function listCoachCourses(params?: ListParams): Promise<PaginatedResponse<Course>> {
  return apiRequest(
    `/api/v1/coach/courses${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

export async function createCoachCourse(body: CreateCourseRequest): Promise<Course> {
  const payload: CreateCourseRequest = {
    title: body.title,
    ...(body.description?.trim() ? { description: body.description.trim() } : {}),
  }
  return apiRequest<Course>("/api/v1/coach/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getCoachCourseDetail(id: string): Promise<CourseDetailResponse> {
  return apiRequest<CourseDetailResponse>(`/api/v1/coach/courses/${id}`)
}

export async function updateCoachCourse(id: string, body: UpdateCourseRequest): Promise<Course> {
  return apiRequest<Course>(`/api/v1/coach/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function archiveCoachCourse(id: string): Promise<Course> {
  return apiRequest<Course>(`/api/v1/coach/courses/${id}/archive`, { method: "POST" })
}

export async function createCoachCourseMaterial(
  courseId: string,
  body: {
    title: string
    type: "video" | "pdf" | "link" | "text"
    url?: string
    content?: string
    upload_id?: string
    position?: number
  }
): Promise<CourseMaterial> {
  const payload: Record<string, unknown> = {
    title: body.title.trim(),
    type: body.type,
  }
  if (body.position !== undefined) payload.position = body.position
  if (body.upload_id) payload.upload_id = body.upload_id
  if (body.content?.trim()) payload.content = body.content.trim()
  if (body.url?.trim()) payload.url = body.url.trim()

  return apiRequest<CourseMaterial>(`/api/v1/coach/courses/${courseId}/materials`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateCoachCourseMaterial(
  courseId: string,
  materialId: string,
  body: {
    title?: string
    type?: "video" | "pdf" | "link" | "text"
    url?: string
    content?: string
    upload_id?: string
    position?: number
  }
): Promise<CourseMaterial> {
  return apiRequest<CourseMaterial>(
    `/api/v1/coach/courses/${courseId}/materials/${materialId}`,
    { method: "PATCH", body: JSON.stringify(body) }
  )
}

export async function deleteCoachCourseMaterial(
  courseId: string,
  materialId: string
): Promise<void> {
  return apiRequest(`/api/v1/coach/courses/${courseId}/materials/${materialId}`, {
    method: "DELETE",
  })
}

/** Загрузка файла для материала курса через POST /api/v1/files */
export async function uploadCoachCourseMaterial(
  _courseId: string,
  _materialId: string,
  file: File
): Promise<StorageUploadResponse> {
  const uploaded = await uploadFile(file)
  return {
    download_url: uploaded.url,
    path: uploaded.file_path,
  }
}

export async function publishCoachCourse(id: string): Promise<Course> {
  return apiRequest<Course>(`/api/v1/coach/courses/${id}/publish`, { method: "POST" })
}

export async function listMyCourseAssignments(params?: ListParams): Promise<PaginatedResponse<CourseAssignment>> {
  return apiRequest(
    `/api/v1/my/course-assignments${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
    })}`
  )
}

export async function getMyCourseAssignment(id: string): Promise<CourseAssignment> {
  return apiRequest<CourseAssignment>(`/api/v1/my/course-assignments/${id}`)
}

export async function markCourseAssignmentCompleted(id: string): Promise<void> {
  return apiRequest(`/api/v1/my/course-assignments/${id}/mark-completed`, { method: "POST" })
}

export async function markCourseMaterialCompleted(
  assignmentId: string,
  materialId: string
): Promise<CourseAssignment> {
  return apiRequest<CourseAssignment>(
    `/api/v1/my/course-assignments/${assignmentId}/materials/${materialId}/complete`,
    { method: "POST" }
  )
}

export async function enrollInCourse(courseId: string): Promise<CourseAssignment> {
  return apiRequest<CourseAssignment>("/api/v1/my/course-assignments/enroll", {
    method: "POST",
    body: JSON.stringify({ course_id: courseId }),
  })
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function listAdminExecutorLeads(
  params?: ListParams & { status?: string }
): Promise<PaginatedResponse<ExecutorLeadView>> {
  return apiRequest<PaginatedResponse<ExecutorLeadView>>(
    `/api/v1/admin/executor-leads${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      status: params?.status,
    })}`
  )
}

export async function getAdminExecutorLead(id: string): Promise<ExecutorLeadView> {
  return apiRequest<ExecutorLeadView>(`/api/v1/admin/executor-leads/${id}`)
}

export async function updateAdminExecutorLeadStatus(
  id: string,
  status: string
): Promise<ExecutorLeadView> {
  return apiRequest(`/api/v1/admin/executor-leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
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

export async function getAdminSanction(id: string): Promise<Sanction> {
  return apiRequest<Sanction>(`/api/v1/admin/sanctions/${id}`)
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

export async function getAdminChat(chatId: string): Promise<ChatDetail> {
  return apiRequest<ChatDetail>(`/api/v1/admin/chats/${chatId}`)
}

export async function listAdminChatMessages(
  chatId: string,
  params?: ListParams
): Promise<PaginatedResponse<import("./types").Message>> {
  return apiRequest(
    `/api/v1/admin/chats/${chatId}/messages${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 50,
    })}`
  )
}

export async function listAdminCourseAssignments(
  params?: ListParams & {
    executorId?: string
    courseId?: string
    status?: string
    source?: string
  }
): Promise<PaginatedResponse<CourseAssignment>> {
  return apiRequest(
    `/api/v1/admin/course-assignments${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      executor_id: params?.executorId,
      course_id: params?.courseId,
      status: params?.status,
      source: params?.source,
    })}`
  )
}

export async function createAdminCourseAssignment(
  body: CreateAssignmentRequest
): Promise<CourseAssignment> {
  return apiRequest<CourseAssignment>("/api/v1/admin/course-assignments", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function listAdminCourses(
  params?: ListParams & { status?: string; moderationStatus?: string; q?: string }
): Promise<PaginatedResponse<Course>> {
  return apiRequest(
    `/api/v1/admin/courses${qs({
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      status: params?.status,
      moderation_status: params?.moderationStatus,
      q: params?.q,
    })}`
  )
}

export async function approveAdminCourse(id: string): Promise<Course> {
  return apiRequest<Course>(`/api/v1/admin/courses/${id}/approve`, { method: "POST" })
}

export async function rejectAdminCourse(id: string, reason?: string): Promise<Course> {
  return apiRequest<Course>(`/api/v1/admin/courses/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(reason?.trim() ? { reason: reason.trim() } : {}),
  })
}

export async function listAdminNotifications(params?: ListParams): Promise<PaginatedResponse<Notification>> {
  return apiRequest(
    `/api/v1/admin/notifications${qs({ page: params?.page ?? 1, page_size: params?.pageSize ?? 20 })}`
  )
}

export async function getAdminNotification(id: string): Promise<Notification> {
  return apiRequest<Notification>(`/api/v1/admin/notifications/${id}`)
}

export async function pingApi(): Promise<{ status: string }> {
  return apiRequest("/api/v1/ping")
}

export async function healthCheck(): Promise<{ status: string }> {
  return apiRequest("/healthz")
}
