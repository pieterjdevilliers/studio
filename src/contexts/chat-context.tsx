"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { 
  ChatMessage, 
  ChatConversation, 
  ChatTypingIndicator, 
  ChatNotification, 
  UserPresence, 
  ChatSettings,
  ChatAttachment 
} from "@/types/chat";

interface ChatContextType {
  // Messages and Conversations
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>; // conversationId -> messages
  activeConversation: ChatConversation | null;
  
  // Real-time features
  typingIndicators: ChatTypingIndicator[];
  userPresence: Record<string, UserPresence>;
  notifications: ChatNotification[];
  
  // Settings
  chatSettings: ChatSettings | null;
  
  // Actions
  sendMessage: (conversationId: string, content: string, attachments?: ChatAttachment[], replyToId?: string) => Promise<void>;
  createConversation: (type: ChatConversation["type"], participants: string[], name?: string, taskId?: string, caseId?: string) => Promise<ChatConversation>;
  setActiveConversation: (conversation: ChatConversation | null) => void;
  markAsRead: (conversationId: string, messageId?: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  updatePresence: (status: UserPresence["status"], activity?: string) => void;
  updateChatSettings: (settings: Partial<ChatSettings>) => void;
  
  // File handling
  uploadFile: (file: File) => Promise<ChatAttachment>;
  
  // Administrative
  archiveConversation: (conversationId: string) => void;
  deleteMessage: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  
  // Search and filtering
  searchMessages: (query: string, conversationId?: string) => ChatMessage[];
  getConversationsByType: (type: ChatConversation["type"]) => ChatConversation[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock data for development
const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: "conv-1",
    type: "direct",
    participants: ["client1", "staff1"],
    lastActivity: new Date().toISOString(),
    isArchived: false,
    createdBy: "client1",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "conv-2",
    type: "case",
    name: "Case Discussion - Test Client",
    participants: ["client1", "staff1", "admin1"],
    lastActivity: new Date().toISOString(),
    isArchived: false,
    createdBy: "staff1",
    caseId: "case1",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "client1",
      content: "Hi, I have a question about my onboarding documents.",
      messageType: "text",
      isEdited: false,
      readBy: ["client1", "staff1"],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: "staff1",
      content: "Hello! I'd be happy to help. What specific question do you have?",
      messageType: "text",
      isEdited: false,
      readBy: ["staff1"],
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "conv-2": [
    {
      id: "msg-3",
      conversationId: "conv-2",
      senderId: "staff1",
      content: "This case requires additional documentation review.",
      messageType: "text",
      isEdited: false,
      readBy: ["staff1", "admin1"],
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, users } = useAuth();
  
  // State
  const [conversations, setConversations] = useState<ChatConversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(MOCK_MESSAGES);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [typingIndicators, setTypingIndicators] = useState<ChatTypingIndicator[]>([]);
  const [userPresence, setUserPresence] = useState<Record<string, UserPresence>>({});
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);

  // Initialize user presence and settings
  useEffect(() => {
    if (user) {
      // Initialize presence for all users
      const initialPresence: Record<string, UserPresence> = {};
      users.forEach(u => {
        initialPresence[u.id] = {
          userId: u.id,
          status: u.id === user.id ? "online" : "offline",
          lastSeen: new Date().toISOString(),
        };
      });
      setUserPresence(initialPresence);

      // Initialize chat settings
      setChatSettings({
        userId: user.id,
        notifications: {
          desktop: true,
          sound: true,
          mentions: true,
          directMessages: true,
        },
        privacy: {
          readReceipts: true,
          typingIndicators: true,
          onlineStatus: true,
        },
        blockedUsers: [],
      });
    }
  }, [user, users]);

  // Send message
  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    attachments?: ChatAttachment[], 
    replyToId?: string
  ) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      content,
      messageType: attachments && attachments.length > 0 ? "file" : "text",
      attachments,
      replyToId,
      isEdited: false,
      readBy: [user.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    // Update conversation last activity
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessageId: newMessage.id, lastActivity: new Date().toISOString() }
          : conv
      )
    );

    // Create notifications for other participants
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      const otherParticipants = conversation.participants.filter(p => p !== user.id);
      const newNotifications: ChatNotification[] = otherParticipants.map(participantId => ({
        id: `notif-${Date.now()}-${participantId}`,
        userId: participantId,
        conversationId,
        messageId: newMessage.id,
        type: "new_message",
        isRead: false,
        createdAt: new Date().toISOString(),
      }));
      setNotifications(prev => [...prev, ...newNotifications]);
    }
  }, [user, conversations]);

  // Create conversation
  const createConversation = useCallback(async (
    type: ChatConversation["type"],
    participants: string[],
    name?: string,
    taskId?: string,
    caseId?: string
  ): Promise<ChatConversation> => {
    if (!user) throw new Error("User not authenticated");

    const newConversation: ChatConversation = {
      id: `conv-${Date.now()}`,
      type,
      name,
      participants: [...new Set([...participants, user.id])], // Ensure current user is included
      lastActivity: new Date().toISOString(),
      isArchived: false,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskId,
      caseId,
    };

    setConversations(prev => [newConversation, ...prev]);
    setMessages(prev => ({ ...prev, [newConversation.id]: [] }));

    return newConversation;
  }, [user]);

  // Mark messages as read
  const markAsRead = useCallback((conversationId: string, messageId?: string) => {
    if (!user) return;

    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId]?.map(msg => {
        if (!messageId || msg.id === messageId) {
          return {
            ...msg,
            readBy: [...new Set([...msg.readBy, user.id])],
          };
        }
        return msg;
      }) || [],
    }));

    // Mark notifications as read
    setNotifications(prev => 
      prev.map(notif => 
        notif.conversationId === conversationId && notif.userId === user.id
          ? { ...notif, isRead: true }
          : notif
      )
    );
  }, [user]);

  // Set typing indicator
  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!user) return;

    setTypingIndicators(prev => {
      const filtered = prev.filter(t => !(t.conversationId === conversationId && t.userId === user.id));
      if (isTyping) {
        return [...filtered, {
          conversationId,
          userId: user.id,
          isTyping: true,
          timestamp: new Date().toISOString(),
        }];
      }
      return filtered;
    });

    // Auto-clear typing indicator after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingIndicators(prev => 
          prev.filter(t => !(t.conversationId === conversationId && t.userId === user.id))
        );
      }, 3000);
    }
  }, [user]);

  // Update user presence
  const updatePresence = useCallback((status: UserPresence["status"], activity?: string) => {
    if (!user) return;

    setUserPresence(prev => ({
      ...prev,
      [user.id]: {
        userId: user.id,
        status,
        lastSeen: new Date().toISOString(),
        currentActivity: activity,
      },
    }));
  }, [user]);

  // Update chat settings
  const updateChatSettings = useCallback((settings: Partial<ChatSettings>) => {
    if (!user) return;

    setChatSettings(prev => prev ? { ...prev, ...settings } : null);
  }, [user]);

  // Upload file (mock implementation)
  const uploadFile = useCallback(async (file: File): Promise<ChatAttachment> => {
    // In a real app, this would upload to a cloud storage service
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const attachment: ChatAttachment = {
          id: `file-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: `mock://files/${file.name}`,
          dataUrl: reader.result as string,
        };
        resolve(attachment);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Archive conversation
  const archiveConversation = useCallback((conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, isArchived: true, updatedAt: new Date().toISOString() }
          : conv
      )
    );
  }, []);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => {
      const newMessages = { ...prev };
      Object.keys(newMessages).forEach(conversationId => {
        newMessages[conversationId] = newMessages[conversationId].filter(msg => msg.id !== messageId);
      });
      return newMessages;
    });
  }, []);

  // Edit message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => {
      const newMessages = { ...prev };
      Object.keys(newMessages).forEach(conversationId => {
        newMessages[conversationId] = newMessages[conversationId].map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent, isEdited: true, updatedAt: new Date().toISOString() }
            : msg
        );
      });
      return newMessages;
    });
  }, []);

  // Block/unblock user
  const blockUser = useCallback((userId: string) => {
    setChatSettings(prev => prev ? {
      ...prev,
      blockedUsers: [...prev.blockedUsers, userId],
    } : null);
  }, []);

  const unblockUser = useCallback((userId: string) => {
    setChatSettings(prev => prev ? {
      ...prev,
      blockedUsers: prev.blockedUsers.filter(id => id !== userId),
    } : null);
  }, []);

  // Search messages
  const searchMessages = useCallback((query: string, conversationId?: string): ChatMessage[] => {
    const searchIn = conversationId ? [conversationId] : Object.keys(messages);
    const results: ChatMessage[] = [];
    
    searchIn.forEach(convId => {
      const convMessages = messages[convId] || [];
      const matches = convMessages.filter(msg => 
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...matches);
    });
    
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [messages]);

  // Get conversations by type
  const getConversationsByType = useCallback((type: ChatConversation["type"]): ChatConversation[] => {
    return conversations.filter(conv => conv.type === type && !conv.isArchived);
  }, [conversations]);

  const value: ChatContextType = {
    conversations,
    messages,
    activeConversation,
    typingIndicators,
    userPresence,
    notifications,
    chatSettings,
    sendMessage,
    createConversation,
    setActiveConversation,
    markAsRead,
    setTyping,
    updatePresence,
    updateChatSettings,
    uploadFile,
    archiveConversation,
    deleteMessage,
    editMessage,
    blockUser,
    unblockUser,
    searchMessages,
    getConversationsByType,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}