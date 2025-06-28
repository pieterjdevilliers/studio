export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "file" | "system";
  attachments?: ChatAttachment[];
  replyToId?: string;
  isEdited: boolean;
  readBy: string[]; // Array of user IDs who have read this message
  createdAt: string;
  updatedAt: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string; // MIME type
  size: number;
  url: string; // In real app, this would be a secure URL
  dataUrl?: string; // For preview/download
}

export interface ChatConversation {
  id: string;
  type: "direct" | "group" | "task" | "case";
  name?: string; // For group chats or named conversations
  participants: string[]; // Array of user IDs
  lastMessageId?: string;
  lastActivity: string;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Context-specific fields
  taskId?: string;
  caseId?: string;
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

export interface ChatTypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface ChatNotification {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  type: "mention" | "new_message" | "file_shared";
  isRead: boolean;
  createdAt: string;
}

export interface UserPresence {
  userId: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeen: string;
  currentActivity?: string;
}

export interface ChatSettings {
  userId: string;
  notifications: {
    desktop: boolean;
    sound: boolean;
    mentions: boolean;
    directMessages: boolean;
  };
  privacy: {
    readReceipts: boolean;
    typingIndicators: boolean;
    onlineStatus: boolean;
  };
  blockedUsers: string[];
}