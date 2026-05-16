import type {
  Chat,
  ChatMessage,
  MeResponse,
  Message,
  UserProfile,
} from "./types"

/** Supports nested `{ user, profile }` and flat `/auth/me` payloads. */
export function normalizeMeResponse(data: MeResponse | Record<string, unknown>): UserProfile {
  const root = data as Record<string, unknown>
  const nested = root.user as MeResponse["user"] | undefined
  const user =
    nested ??
    ({
      id: String(root.id ?? ""),
      email: String(root.email ?? ""),
      role: root.role as UserProfile["role"],
      is_active: root.is_active as boolean | undefined,
      created_at: root.created_at as string | undefined,
      verification_status: root.verification_status as UserProfile["verification_status"],
    } satisfies MeResponse["user"])
  const profile = (root.profile ?? {}) as Record<string, unknown>
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at,
    verification_status: user.verification_status,
    profile: {
      profile_name:
        (profile.display_name as string) ??
        (profile.profile_name as string) ??
        (profile.company_name as string),
      avatar_url: profile.avatar_url as string | undefined,
      phone: profile.phone as string | undefined,
      about: profile.about as string | undefined,
      bio: profile.bio as string | undefined,
      company_name: profile.company_name as string | undefined,
      ...profile,
    },
  }
}

export function normalizeMessage(msg: Message, currentUserId?: string): ChatMessage {
  const deleted = Boolean(msg.deleted_at)
  return {
    id: msg.id,
    chat_id: msg.chat_id,
    sender_id: msg.sender_user_id ?? "",
    content: deleted ? "Сообщение удалено" : msg.body,
    created_at: msg.created_at,
    is_read: currentUserId ? msg.sender_user_id === currentUserId : false,
    deleted_at: msg.deleted_at ?? null,
    edited_at: msg.edited_at ?? null,
  }
}

export function normalizeChatSummary(chat: {
  id: string
  order_id: string
  created_at: string
  participants?: { user_id: string; role?: string }[]
  last_message?: string
  last_message_at?: string
}): Chat {
  return {
    id: chat.id,
    order_id: chat.order_id,
    participant_ids: chat.participants?.map((p) => p.user_id) ?? [],
    created_at: chat.created_at,
    last_message: chat.last_message,
    last_message_at: chat.last_message_at,
  }
}
