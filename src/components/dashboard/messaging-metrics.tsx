"use client";

import { useState, useEffect, useMemo } from "react";
import { useChat } from "@/contexts/chat-context";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  BarChart3
} from "lucide-react";
import { formatDistanceToNow, subHours, subDays, isAfter } from "date-fns";

interface MessageMetrics {
  totalMessages: number;
  messagesLast24h: number;
  messagesLastHour: number;
  averageResponseTime: number;
  completionRate: number;
  errorRate: number;
  activeConversations: number;
  userEngagement: {
    totalActiveUsers: number;
    messagesPerUser: number;
    peakHours: string[];
  };
}

interface HourlyData {
  hour: string;
  messages: number;
  responses: number;
  errors: number;
}

export function MessagingMetrics() {
  const { conversations, messages, notifications } = useChat();
  const { users } = useAuth();
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("24h");

  const metrics = useMemo((): MessageMetrics => {
    const now = new Date();
    const last24h = subHours(now, 24);
    const lastHour = subHours(now, 1);

    // Get all messages across conversations
    const allMessages = Object.values(messages).flat();
    
    // Filter messages by time range
    const messagesLast24h = allMessages.filter(msg => 
      isAfter(new Date(msg.createdAt), last24h)
    );
    const messagesLastHour = allMessages.filter(msg => 
      isAfter(new Date(msg.createdAt), lastHour)
    );

    // Calculate response times
    const responseTimes: number[] = [];
    conversations.forEach(conv => {
      const convMessages = messages[conv.id] || [];
      for (let i = 1; i < convMessages.length; i++) {
        const prevMsg = convMessages[i - 1];
        const currentMsg = convMessages[i];
        if (prevMsg.senderId !== currentMsg.senderId) {
          const responseTime = new Date(currentMsg.createdAt).getTime() - 
                              new Date(prevMsg.createdAt).getTime();
          responseTimes.push(responseTime);
        }
      }
    });

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate completion rate (conversations with recent activity)
    const activeConversations = conversations.filter(conv => 
      isAfter(new Date(conv.lastActivity), last24h)
    ).length;

    // Calculate user engagement
    const activeUsers = new Set(messagesLast24h.map(msg => msg.senderId));
    const messagesPerUser = activeUsers.size > 0 ? messagesLast24h.length / activeUsers.size : 0;

    // Calculate peak hours
    const hourlyActivity: Record<string, number> = {};
    messagesLast24h.forEach(msg => {
      const hour = new Date(msg.createdAt).getHours().toString().padStart(2, '0');
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    return {
      totalMessages: allMessages.length,
      messagesLast24h: messagesLast24h.length,
      messagesLastHour: messagesLastHour.length,
      averageResponseTime: averageResponseTime / (1000 * 60), // Convert to minutes
      completionRate: conversations.length > 0 ? (activeConversations / conversations.length) * 100 : 0,
      errorRate: 0, // Would be calculated from actual error tracking
      activeConversations,
      userEngagement: {
        totalActiveUsers: activeUsers.size,
        messagesPerUser,
        peakHours,
      },
    };
  }, [conversations, messages, timeRange]);

  const hourlyData = useMemo((): HourlyData[] => {
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = subHours(now, 23 - i);
      return {
        hour: hour.getHours().toString().padStart(2, '0') + ':00',
        messages: 0,
        responses: 0,
        errors: 0,
      };
    });

    const allMessages = Object.values(messages).flat();
    const last24hMessages = allMessages.filter(msg => 
      isAfter(new Date(msg.createdAt), subHours(now, 24))
    );

    last24hMessages.forEach(msg => {
      const msgHour = new Date(msg.createdAt).getHours();
      const hourIndex = hours.findIndex(h => h.hour === `${msgHour.toString().padStart(2, '0')}:00`);
      if (hourIndex !== -1) {
        hours[hourIndex].messages++;
      }
    });

    return hours;
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages (24h)</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.messagesLast24h}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.messagesLastHour} in the last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageResponseTime.toFixed(1)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userEngagement.totalActiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.userEngagement.messagesPerUser.toFixed(1)} messages per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <Progress value={metrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Message Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Message Volume (24h)
            </CardTitle>
            <CardDescription>
              Hourly message distribution over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hourlyData.slice(-12).map((data, index) => (
                <div key={data.hour} className="flex items-center gap-2">
                  <span className="text-sm font-mono w-12">{data.hour}</span>
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(5, (data.messages / Math.max(...hourlyData.map(h => h.messages))) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{data.messages}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Engagement
            </CardTitle>
            <CardDescription>
              User activity and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Active Conversations</span>
                <span className="text-sm text-muted-foreground">{metrics.activeConversations}</span>
              </div>
              <Progress value={(metrics.activeConversations / Math.max(conversations.length, 1)) * 100} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Peak Hours</span>
              </div>
              <div className="flex gap-2">
                {metrics.userEngagement.peakHours.map(hour => (
                  <Badge key={hour} variant="secondary">{hour}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Messages</span>
                <span className="text-lg font-bold">{metrics.totalMessages}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Unread Notifications</span>
                <span className="text-lg font-bold text-destructive">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Message Status Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of message types and conversation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Conversation Types</h4>
              {['direct', 'group', 'task', 'case'].map(type => {
                const count = conversations.filter(c => c.type === type).length;
                const percentage = conversations.length > 0 ? (count / conversations.length) * 100 : 0;
                return (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Message Types</h4>
              {['text', 'file', 'system'].map(type => {
                const allMessages = Object.values(messages).flat();
                const count = allMessages.filter(m => m.messageType === type).length;
                const percentage = allMessages.length > 0 ? (count / allMessages.length) * 100 : 0;
                return (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Activity Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Today</span>
                  <Badge variant="default">{metrics.activeConversations}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Archived</span>
                  <Badge variant="secondary">
                    {conversations.filter(c => c.isArchived).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total</span>
                  <Badge variant="outline">{conversations.length}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}