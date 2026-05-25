// Authentication
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  role: "client" | "executor" | "coach"
  profile_name: string
  phone?: string
  client_type?: string
  tax_number?: string
  contact_name?: string
  contact_position?: string
  address?: string
  about?: string
  website?: string
  first_name?: string
  last_name?: string
  middle_name?: string
  iin?: string
  city?: string
  experience_level?: string
  specializations?: string[]
  education?: string
  work_format?: string
  hourly_rate?: number
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export interface User {
  id: string
  email: string
  role: "client" | "executor" | "coach" | "admin"
  is_active: boolean
  created_at: string
  verification_status?: "none" | "pending" | "in_review" | "verified" | "rejected"
}

export interface MeResponse {
  user: User
  profile?: Record<string, unknown>
}

/** @deprecated Use MeResponse + normalizeMeResponse */
export interface AuthResponse {
  user: User
  tokens: TokenPair
  profile?: Record<string, unknown>
}

export interface UserProfile {
  id: string
  email: string
  role: "client" | "executor" | "coach" | "admin"
  is_active?: boolean
  created_at?: string
  verification_status?: string
  profile?: {
    profile_name?: string
    display_name?: string
    avatar_url?: string
    phone?: string
    about?: string
    bio?: string
    company_name?: string
    [key: string]: unknown
  }
}

export type ProfileResponse = Record<string, unknown>
export type UpdateProfileRequest = Record<string, unknown>

// Orders
export type OrderStatus =
  | "draft"
  | "payment_pending"
  | "published"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "archived"

export interface Order {
  id: string
  title: string
  description: string
  category_slug?: string
  category_name?: string
  category_id?: number
  budget_amount: number
  currency?: string
  status: OrderStatus
  client_id?: string
  selected_response_id?: string | null
  created_at: string
  updated_at: string
  published_at?: string
  cancelled_at?: string
}

export interface OrderDetailsResponse {
  order: Order
  latest_payment?: PaymentTransaction
}

export interface PaymentTransaction {
  id: string
  status: string
  amount?: number
}

export interface CreateOrderRequest {
  title: string
  description: string
  category_slug?: string
  category_id?: number
  budget_amount: number
  currency?: string
  region?: string
  deadline_at?: string
  promotions?: Array<"top" | "pin" | "highlight">
}

export interface UpdateOrderRequest {
  title?: string
  description?: string
  category_slug?: string
  budget_amount?: number
  currency?: string
  region?: string
  deadline_at?: string
  promotions?: Array<"top" | "pin" | "highlight">
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

// Responses
export type ResponseStatus =
  | "draft"
  | "payment_pending"
  | "submitted"
  | "accepted"
  | "rejected"
  | "cancelled"

export interface OrderResponse {
  id: string
  order_id: string
  executor_id: string
  proposed_amount: number
  proposed_deadline?: string
  cover_letter: string
  status: ResponseStatus
  is_paid?: boolean
  created_at: string
  updated_at: string
}

export interface UpdateResponseRequest {
  proposed_amount?: number
  proposed_deadline?: string
  cover_letter?: string
}

export interface Selection {
  order_id: string
  response_id: string
  executor_id: string
  selected_at: string
}

// Chat
export interface ChatParticipant {
  user_id: string
  role?: string
  display_name?: string
}

export interface Chat {
  id: string
  order_id: string
  participant_ids: string[]
  created_at: string
  last_message?: string
  last_message_at?: string
  participants?: ChatParticipant[]
}

export interface ChatDetail extends Chat {
  participants: ChatParticipant[]
}

/** Backend message shape */
export interface Message {
  id: string
  chat_id: string
  sender_type: "user" | "system"
  sender_user_id?: string
  body?: string
  text?: string
  created_at: string
  edited_at?: string
  deleted_at?: string
}

/** UI-normalized message */
export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
  deleted_at?: string | null
  edited_at?: string | null
}

export interface SendMessageRequest {
  text?: string
  attachment_ids?: string[]
}

// Notifications
export type NotificationType =
  | "order_published"
  | "response_submitted"
  | "response_selected"
  | "order_completed"
  | "review_created"
  | "sanction_created"
  | "course_assigned"
  | "course_completed"
  | "chat_message_received"
  | string

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  status: "unread" | "read"
  payload: Record<string, string>
  created_at: string
  read_at: string | null
}

// Courses
export interface Course {
  id: string
  coach_id?: string
  created_by?: string
  title: string
  description?: string
  category?: string
  status: "draft" | "published" | "archived"
  created_at: string
  updated_at: string
}

export interface CreateCourseRequest {
  title: string
  description: string
}

export interface UpdateCourseRequest {
  title?: string
  description?: string
}

export interface CourseDetailResponse {
  course: Course
  materials: CourseMaterial[]
}

export interface CourseMaterial {
  id: string
  course_id: string
  type: "video" | "pdf" | "link" | "text"
  title: string
  url: string | null
  content: string | null
  created_at: string
}

export interface CourseAssignment {
  id: string
  course_id: string
  executor_id: string
  status: "active" | "completed" | "cancelled"
  source?:
    | "manual_admin"
    | "sanction_low_rating_first"
    | "sanction_low_rating_repeat"
  assigned_by: string | null
  created_at: string
  updated_at: string
}

// Reviews & rating
export interface Review {
  id: string
  order_id: string
  client_id: string
  executor_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at?: string
}

export interface CreateReviewRequest {
  rating: number
  comment?: string
}

export interface RatingInfo {
  executor_id: string
  reviews_count_total: number
  reviews_count_recent: number
  avg_rating_recent: number
  avg_rating_total: number
}

export type ReviewTargetType =
  | "user"
  | "client"
  | "executor"
  | "coach"
  | "profile"
  | "order"
  | "response"
  | "review"
  | "course"
  | "course_material"

export interface EntityReview {
  id: string
  target_type: ReviewTargetType
  target_id: string
  author_id?: string
  rating: number
  comment?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CreateEntityReviewRequest {
  target_type: ReviewTargetType
  target_id: string
  rating: number
  comment?: string
  metadata?: Record<string, unknown>
}

export interface EntityRatingSummary {
  target_type: ReviewTargetType
  target_id: string
  rating_avg: number
  rating_count: number
  updated_at: string
}

export interface Wallet {
  user_id: string
  balance: number
  currency: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  amount: number
  direction: "credit" | "debit"
  currency: string
  reason: string
  order_id?: string
  created_by?: string
  created_at: string
}

export interface WalletResponse {
  wallet: Wallet
  transactions: WalletTransaction[]
}

export interface CreditWalletRequest {
  amount: number
  reason?: string
}

export interface SetAvatarRequest {
  upload_id: string
}

export interface CreateAssignmentRequest {
  course_id: string
  executor_id: string
  source: "manual_admin" | "sanction_low_rating_first" | "sanction_low_rating_repeat"
  due_at?: string
  reason?: string
}

export interface ReorderAttachmentsRequest {
  ids: string[]
}

// Sanctions & leads
export interface Sanction {
  id: string
  executor_id: string
  status: "active" | "resolved" | "expired"
  reason: string
  severity: number
  started_at: string
  ends_at?: string
  resolved_at?: string
}

export type AttachmentTargetType =
  | "profile_document"
  | "order_attachment"
  | "response_attachment"
  | "review_attachment"
  | "chat_attachment"
  | "course_material"

export interface UploadView {
  id: string
  author_id: string
  file_path: string
  url: string
  original_name: string
  mime_type: string
  size_bytes: number
  created_at: string
}

export interface AttachmentView {
  id: string
  target_type: AttachmentTargetType
  target_id: string
  upload_id: string
  url?: string
  original_name?: string
}

export interface ExecutorLeadSubmittedResponse {
  lead_id: string
  status: string
  message: string
}

export interface ExecutorLeadView {
  id: string
  email: string
  first_name?: string
  last_name?: string
  city?: string
  about?: string
  education?: string
  experience_level?: string
  hourly_rate?: number
  iin?: string
  status?: string
  created_at: string
  documents?: { id: string; type: string; url?: string }[]
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly requestId?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    request_id: string
  }
}
