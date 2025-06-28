"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/contexts/chat-context";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import type { ChatConversation } from "@/types/chat";

export default function MessagesPage() {
  const { user } = useAuth();
  const { activeConversation, setActiveConversation } = useChat();

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Please log in to access messages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with team members and clients in real-time
        </p>
      </div>

      <Card className="h-[calc(100vh-200px)] overflow-hidden">
        <div className="flex h-full">
          <ChatSidebar 
            onConversationSelect={setActiveConversation}
            selectedConversation={activeConversation}
          />
          <div className="flex-1">
            {activeConversation ? (
              <ChatInterface />
            ) : (
              <div className="flex-1 flex items-center justify-center h-full">
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
      </Card>
    </div>
  );
}