import type {
  Chat,
  ChatMessage,
  MeResponse,
  Message,
  UserProfile,
} from "./types"

export function normalizeMeResponse(data: MeResponse): UserProfile {
  const profile = data.profile ?? {}
  return {
    id: data.user.id,
    email: data.user.email,
    role: data.user.role,
    is_active: data.user.is_active,
    created_at: data.user.created_at,
    verification_status: data.user.verification_status,
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
  return {
    id: msg.id,
    chat_id: msg.chat_id,
    sender_id: msg.sender_user_id ?? "",
    content: msg.body,
    created_at: msg.created_at,
    is_read: currentUserId ? msg.sender_user_id === currentUserId : false,
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
