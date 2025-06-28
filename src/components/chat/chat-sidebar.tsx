"use client";

import { useState } from "react";
import { useChat } from "@/contexts/chat-context";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Users, 
  FileText, 
  ClipboardList,
  Settings
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ChatConversation } from "@/types/chat";

interface ChatSidebarProps {
  onConversationSelect: (conversation: ChatConversation) => void;
  selectedConversation?: ChatConversation | null;
}

export function ChatSidebar({ onConversationSelect, selectedConversation }: ChatSidebarProps) {
  const { user, users, cases, tasks } = useAuth();
  const { 
    conversations, 
    messages, 
    notifications, 
    createConversation,
    getConversationsByType 
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "direct" | "group" | "task" | "case">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newConversationType, setNewConversationType] = useState<ChatConversation["type"]>("direct");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [conversationName, setConversationName] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedCase, setSelectedCase] = useState("");

  const getParticipantName = (userId: string) => {
    const participant = users.find(u => u.id === userId);
    return participant?.name || "Unknown User";
  };

  const getParticipantInitials = (userId: string) => {
    const name = getParticipantName(userId);
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getUnreadCount = (conversationId: string) => {
    const conversationMessages = messages[conversationId] || [];
    return conversationMessages.filter(m => !m.readBy.includes(user?.id || "")).length;
  };

  const filteredConversations = conversations.filter(conv => {
    // Filter by type
    if (filterType !== "all" && conv.type !== filterType) return false;
    
    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesName = conv.name?.toLowerCase().includes(searchLower);
      const matchesParticipant = conv.participants.some(p => 
        getParticipantName(p).toLowerCase().includes(searchLower)
      );
      const matchesMessages = (messages[conv.id] || []).some(m => 
        m.content.toLowerCase().includes(searchLower)
      );
      
      if (!matchesName && !matchesParticipant && !matchesMessages) return false;
    }
    
    return !conv.isArchived;
  }).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

  const handleCreateConversation = async () => {
    if (selectedParticipants.length === 0) return;

    try {
      const newConversation = await createConversation(
        newConversationType,
        selectedParticipants,
        conversationName || undefined,
        selectedTask || undefined,
        selectedCase || undefined
      );
      
      onConversationSelect(newConversation);
      setIsCreateDialogOpen(false);
      resetCreateForm();
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const resetCreateForm = () => {
    setSelectedParticipants([]);
    setConversationName("");
    setSelectedTask("");
    setSelectedCase("");
    setNewConversationType("direct");
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getConversationDisplayName = (conversation: ChatConversation) => {
    if (conversation.name) return conversation.name;
    
    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find(p => p !== user?.id);
      return getParticipantName(otherParticipant || "");
    }
    
    return `${conversation.type} (${conversation.participants.length})`;
  };

  const getLastMessage = (conversation: ChatConversation) => {
    const conversationMessages = messages[conversation.id] || [];
    return conversationMessages[conversationMessages.length - 1];
  };

  return (
    <div className="w-80 border-r bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </h3>
          <div className="flex gap-1">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Conversation Type</Label>
                    <Select value={newConversationType} onValueChange={(value: ChatConversation["type"]) => setNewConversationType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">Direct Message</SelectItem>
                        <SelectItem value="group">Group Chat</SelectItem>
                        <SelectItem value="task">Task Discussion</SelectItem>
                        <SelectItem value="case">Case Discussion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(newConversationType === "group" || newConversationType === "task" || newConversationType === "case") && (
                    <div>
                      <Label>Conversation Name</Label>
                      <Input
                        value={conversationName}
                        onChange={(e) => setConversationName(e.target.value)}
                        placeholder="Enter conversation name"
                      />
                    </div>
                  )}

                  {newConversationType === "task" && (
                    <div>
                      <Label>Related Task</Label>
                      <Select value={selectedTask} onValueChange={setSelectedTask}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                        <SelectContent>
                          {tasks.map(task => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newConversationType === "case" && (
                    <div>
                      <Label>Related Case</Label>
                      <Select value={selectedCase} onValueChange={setSelectedCase}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a case" />
                        </SelectTrigger>
                        <SelectContent>
                          {cases.map(caseItem => (
                            <SelectItem key={caseItem.id} value={caseItem.id}>
                              {caseItem.clientName} - {caseItem.clientType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Participants</Label>
                    <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                      {users.filter(u => u.id !== user?.id).map(participant => (
                        <div key={participant.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={participant.id}
                            checked={selectedParticipants.includes(participant.id)}
                            onCheckedChange={() => toggleParticipant(participant.id)}
                          />
                          <Label htmlFor={participant.id} className="flex items-center gap-2 cursor-pointer">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`https://picsum.photos/seed/${participant.id}/24/24`} />
                              <AvatarFallback className="text-xs">
                                {getParticipantInitials(participant.id)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{participant.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {participant.role}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateConversation} disabled={selectedParticipants.length === 0}>
                      Create Conversation
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          {[
            { key: "all", label: "All", icon: MessageSquare },
            { key: "direct", label: "Direct", icon: Users },
            { key: "group", label: "Groups", icon: Users },
            { key: "task", label: "Tasks", icon: ClipboardList },
            { key: "case", label: "Cases", icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              size="sm"
              variant={filterType === key ? "default" : "ghost"}
              onClick={() => setFilterType(key as typeof filterType)}
              className="text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const lastMessage = getLastMessage(conversation);
              const unreadCount = getUnreadCount(conversation.id);
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted"
                  }`}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        {conversation.type === "direct" ? (
                          <>
                            <AvatarImage src={`https://picsum.photos/seed/${conversation.participants.find(p => p !== user?.id)}/40/40`} />
                            <AvatarFallback>
                              {getParticipantInitials(conversation.participants.find(p => p !== user?.id) || "")}
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback>
                            {conversation.type === "group" && <Users className="h-5 w-5" />}
                            {conversation.type === "task" && <ClipboardList className="h-5 w-5" />}
                            {conversation.type === "case" && <FileText className="h-5 w-5" />}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">
                          {getConversationDisplayName(conversation)}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage ? (
                            <>
                              {lastMessage.senderId === user?.id ? "You: " : `${getParticipantName(lastMessage.senderId)}: `}
                              {lastMessage.content}
                            </>
                          ) : (
                            "No messages yet"
                          )}
                        </p>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      
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
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
              {!searchQuery && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Start a conversation
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}