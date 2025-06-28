"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/contexts/chat-context";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Settings,
  Archive,
  Trash2,
  Edit,
  Reply,
  Download,
  Eye,
  Users,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import type { ChatConversation, ChatMessage, ChatAttachment } from "@/types/chat";

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const { user, users } = useAuth();
  const {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    sendMessage,
    markAsRead,
    setTyping,
    typingIndicators,
    userPresence,
    uploadFile,
    deleteMessage,
    editMessage,
    archiveConversation,
  } = useChat();

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversation]);

  // Mark messages as read when conversation becomes active
  useEffect(() => {
    if (activeConversation) {
      markAsRead(activeConversation.id);
    }
  }, [activeConversation, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    await sendMessage(
      activeConversation.id, 
      messageInput.trim(), 
      undefined, 
      replyToMessage?.id
    );
    
    setMessageInput("");
    setReplyToMessage(null);
    handleStopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      setTyping(activeConversation?.id || "", true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      setTyping(activeConversation?.id || "", false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    try {
      const attachment = await uploadFile(file);
      await sendMessage(activeConversation.id, `Shared file: ${file.name}`, [attachment]);
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;
    
    await editMessage(messageId, editingContent.trim());
    setEditingMessageId(null);
    setEditingContent("");
  };

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const getParticipantName = (userId: string) => {
    const participant = users.find(u => u.id === userId);
    return participant?.name || "Unknown User";
  };

  const getParticipantInitials = (userId: string) => {
    const name = getParticipantName(userId);
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getUserPresenceStatus = (userId: string) => {
    return userPresence[userId]?.status || "offline";
  };

  const getPresenceColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "busy": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.name?.toLowerCase().includes(searchLower) ||
      conv.participants.some(p => getParticipantName(p).toLowerCase().includes(searchLower))
    );
  });

  const activeMessages = activeConversation ? messages[activeConversation.id] || [] : [];
  const activeTypingIndicators = typingIndicators.filter(
    t => t.conversationId === activeConversation?.id && t.userId !== user?.id
  );

  return (
    <div className={`flex h-[600px] border rounded-lg overflow-hidden ${className}`}>
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </h3>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const lastMessage = conversation.lastMessageId 
                ? activeMessages.find(m => m.id === conversation.lastMessageId)
                : activeMessages[activeMessages.length - 1];
              
              const unreadCount = activeMessages.filter(
                m => !m.readBy.includes(user?.id || "")
              ).length;

              const otherParticipants = conversation.participants.filter(p => p !== user?.id);
              const displayName = conversation.name || 
                (conversation.type === "direct" 
                  ? getParticipantName(otherParticipants[0])
                  : `Group (${conversation.participants.length})`);

              return (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeConversation?.id === conversation.id 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://picsum.photos/seed/${otherParticipants[0]}/40/40`} />
                        <AvatarFallback>
                          {conversation.type === "group" ? <Users className="h-5 w-5" /> : getParticipantInitials(otherParticipants[0])}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.type === "direct" && (
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getPresenceColor(getUserPresenceStatus(otherParticipants[0]))}`} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{displayName}</p>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage?.content || "No messages yet"}
                        </p>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      {conversation.type !== "direct" && (
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {conversation.type}
                          </Badge>
                          {conversation.taskId && (
                            <Badge variant="secondary" className="text-xs">Task</Badge>
                          )}
                          {conversation.caseId && (
                            <Badge variant="secondary" className="text-xs">Case</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://picsum.photos/seed/${activeConversation.participants[0]}/40/40`} />
                    <AvatarFallback>
                      {activeConversation.type === "group" ? <Users className="h-5 w-5" /> : getParticipantInitials(activeConversation.participants.filter(p => p !== user?.id)[0])}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">
                      {activeConversation.name || 
                        (activeConversation.type === "direct" 
                          ? getParticipantName(activeConversation.participants.filter(p => p !== user?.id)[0])
                          : `Group Chat (${activeConversation.participants.length})`)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {activeConversation.type === "direct" 
                        ? getUserPresenceStatus(activeConversation.participants.filter(p => p !== user?.id)[0])
                        : `${activeConversation.participants.length} participants`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Conversation Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archiveConversation(activeConversation.id)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Conversation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeMessages.map((message) => {
                  const sender = users.find(u => u.id === message.senderId);
                  const isOwnMessage = message.senderId === user?.id;
                  const replyToMessage = message.replyToId 
                    ? activeMessages.find(m => m.id === message.replyToId)
                    : null;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://picsum.photos/seed/${message.senderId}/32/32`} />
                        <AvatarFallback className="text-xs">
                          {getParticipantInitials(message.senderId)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex-1 max-w-[70%] ${isOwnMessage ? "text-right" : ""}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{sender?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                          {message.isEdited && (
                            <span className="text-xs text-muted-foreground">(edited)</span>
                          )}
                        </div>
                        
                        {replyToMessage && (
                          <div className="mb-2 p-2 border-l-2 border-primary/30 bg-muted/50 rounded text-sm">
                            <p className="text-xs text-muted-foreground">
                              Replying to {getParticipantName(replyToMessage.senderId)}
                            </p>
                            <p className="truncate">{replyToMessage.content}</p>
                          </div>
                        )}
                        
                        <div className={`p-3 rounded-lg ${
                          isOwnMessage 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          {editingMessageId === message.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="min-h-[60px]"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleEditMessage(message.id)}>
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => setEditingMessageId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                                      <Paperclip className="h-4 w-4" />
                                      <span className="flex-1 text-sm">{attachment.name}</span>
                                      <Button size="sm" variant="ghost">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        {isOwnMessage && editingMessageId !== message.id && (
                          <div className="flex gap-1 mt-1 justify-end">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setReplyToMessage(message)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => startEditing(message)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteMessage(message.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        
                        {!isOwnMessage && (
                          <div className="flex gap-1 mt-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setReplyToMessage(message)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicators */}
                {activeTypingIndicators.length > 0 && (
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                      <span>
                        {activeTypingIndicators.map(t => getParticipantName(t.userId)).join(", ")} 
                        {activeTypingIndicators.length === 1 ? " is" : " are"} typing...
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Preview */}
            {replyToMessage && (
              <div className="px-4 py-2 border-t bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4" />
                    <span className="text-sm">
                      Replying to {getParticipantName(replyToMessage.senderId)}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setReplyToMessage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {replyToMessage.content}
                </p>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[40px] max-h-[120px] resize-none pr-12"
                  />
                  <Button
                    size="sm"
                    className="absolute right-2 bottom-2"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}