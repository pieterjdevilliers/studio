"use client";

import { useState } from "react";
import { useChat } from "@/contexts/chat-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageSquare, X, Minimize2, Maximize2 } from "lucide-react";
import { ChatInterface } from "./chat-interface";

export function ChatWidget() {
  const { notifications } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg relative"
        >
          <MessageSquare className="h-6 w-6" />
          {unreadNotifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`shadow-xl transition-all duration-200 ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}>
        {isMinimized ? (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">Messages</span>
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadNotifications.length}
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsMinimized(false)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Messages</span>
                {unreadNotifications.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface className="h-full border-0 rounded-none" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}