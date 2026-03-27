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
}

export interface AuthResponse {
  user_id: string
  email: string
  role: "client" | "executor" | "coach" | "admin"
  access_token: string
  refresh_token: string
}

export interface UserProfile {
  id: string
  email: string
  role: "client" | "executor" | "coach" | "admin"
  profile?: {
    profile_name?: string
    avatar_url?: string
  }
}

// Orders
export type OrderStatus =
  | "draft"
  | "payment_pending"
  | "published"
  | "in_progress"
  | "completed"
  | "cancelled"

export interface Order {
  id: string
  title: string
  description: string
  category_slug: string
  budget_amount: number
  status: OrderStatus
  client_id: string
  selected_response_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateOrderRequest {
  title: string
  description: string
  category_slug: string
  budget_amount: number
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
  proposed_deadline: string
  cover_letter: string
  status: ResponseStatus
  is_paid: boolean
  created_at: string
  updated_at: string
}

// Chat
export interface Chat {
  id: string
  order_id: string
  participant_ids: string[]
  created_at: string
}

export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
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
  coach_id: string
  title: string
  description: string
  category: string
  status: "draft" | "published" | "archived"
  created_at: string
  updated_at: string
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
  source:
    | "manual_admin"
    | "sanction_low_rating_first"
    | "sanction_low_rating_repeat"
  assigned_by: string | null
  created_at: string
  updated_at: string
}

// Reviews
export interface Review {
  id: string
  order_id: string
  client_id: string
  executor_id: string
  rating: number
  comment: string
  created_at: string
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
