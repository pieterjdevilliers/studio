"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/contexts/chat-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Hourglass,
  Clock,
  Activity,
  TrendingUp,
  Bell
} from "lucide-react";
import type { ClientCase } from "@/types";
import { useMemo } from "react";

export function EnhancedClientDashboard() {
  const { user, cases } = useAuth();
  const { conversations, messages, notifications } = useChat();

  if (!user) return null;

  const clientCase = cases.find(c => c.clientId === user.id);

  // Calculate client metrics
  const clientMetrics = useMemo(() => {
    const clientConversations = conversations.filter(c => c.participants.includes(user.id));
    const clientMessages = Object.values(messages).flat().filter(m => m.senderId === user.id);
    const unreadNotifications = notifications.filter(n => n.userId === user.id && !n.isRead);
    
    return {
      totalConversations: clientConversations.length,
      totalMessages: clientMessages.length,
      unreadNotifications: unreadNotifications.length,
      activeConversations: clientConversations.filter(c => 
        new Date(c.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      documentsUploaded: clientCase?.documents.length || 0,
      onboardingProgress: getOnboardingProgress(clientCase),
    };
  }, [user.id, conversations, messages, notifications, clientCase]);

  function getOnboardingProgress(caseData: ClientCase | undefined): number {
    if (!caseData) return 0;
    
    switch (caseData.status) {
      case "Pending Submission": return 10;
      case "Information Submitted": return 40;
      case "Under Review": return 70;
      case "Additional Info Required": return 60;
      case "Approved": return 100;
      case "Rejected": return 100;
      default: return 0;
    }
  }

  const getStatusIcon = (status: ClientCase['status']) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "Additional Info Required":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "Information Submitted":
      case "Under Review":
        return <Hourglass className="h-5 w-5 text-blue-500" />;
      case "Rejected":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ClientCase['status']) => {
    switch (status) {
      case "Approved": return "text-green-600 bg-green-50 border-green-200";
      case "Additional Info Required": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Information Submitted":
      case "Under Review": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Rejected": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome, {user.name || "Client"}!</h1>
          <p className="text-muted-foreground">
            Track your FICA onboarding progress and stay connected with our team.
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Onboarding Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.onboardingProgress}%</div>
                <Progress value={clientMetrics.onboardingProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents Uploaded</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.documentsUploaded}</div>
                <p className="text-xs text-muted-foreground">
                  Documents submitted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.activeConversations}</div>
                <p className="text-xs text-muted-foreground">
                  {clientMetrics.totalMessages} total messages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.unreadNotifications}</div>
                <p className="text-xs text-muted-foreground">
                  Unread notifications
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Overview */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Onboarding Status</CardTitle>
              <CardDescription>
                Current status of your FICA onboarding process.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientCase ? (
                <div className={`rounded-lg border p-6 space-y-4 ${getStatusColor(clientCase.status)}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {getStatusIcon(clientCase.status)}
                      Current Status
                    </h3>
                    <Badge variant="outline" className="text-sm font-medium">
                      {clientCase.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">
                      Your application for <span className="font-bold">{clientCase.clientType}</span> FICA is currently <span className="font-bold">{clientCase.status.toLowerCase()}</span>.
                    </p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm">{clientMetrics.onboardingProgress}%</span>
                      </div>
                      <Progress value={clientMetrics.onboardingProgress} className="h-3" />
                    </div>
                  </div>

                  {clientCase.status === "Pending Submission" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Please complete your onboarding information and submit your documents to proceed.
                      </p>
                    </div>
                  )}
                  
                  {clientCase.status === "Additional Info Required" && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        We need some additional information. Please check your messages or update your submission.
                      </p>
                    </div>
                  )}

                  {clientCase.status === "Under Review" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Your application is being reviewed by our team. We'll notify you of any updates.
                      </p>
                    </div>
                  )}

                  {clientCase.status === "Approved" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Congratulations! Your FICA application has been approved.
                      </p>
                    </div>
                  )}

                  {clientCase.status !== "Approved" && clientCase.status !== "Rejected" && (
                    <div className="mt-4">
                      <Button asChild>
                        <Link href="/onboarding">
                          {clientCase.status === "Pending Submission" ? "Start Onboarding" : "View/Update Onboarding"}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border p-6 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No Onboarding Case Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    It seems you haven&apos;t started an onboarding process yet.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/onboarding">Start New Onboarding</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">My Documents</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documents Uploaded</span>
                    <Badge variant="outline">{clientMetrics.documentsUploaded}</Badge>
                  </div>
                  
                  {clientCase?.documents.map((doc, index) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">Uploaded</Badge>
                    </div>
                  ))}
                  
                  {clientMetrics.documentsUploaded === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No documents uploaded yet
                    </p>
                  )}
                </div>
                
                <Button variant="outline" asChild className="w-full mt-4">
                  <Link href="/onboarding?tab=documents">Manage Documents</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Communication</CardTitle>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Conversations</span>
                    <Badge variant="outline">{clientMetrics.activeConversations}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Messages</span>
                    <Badge variant="outline">{clientMetrics.totalMessages}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unread Notifications</span>
                    <Badge variant={clientMetrics.unreadNotifications > 0 ? "destructive" : "outline"}>
                      {clientMetrics.unreadNotifications}
                    </Badge>
                  </div>
                </div>
                
                <Button variant="outline" asChild className="w-full mt-4">
                  <Link href="/messages">View Messages</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          {clientCase && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Onboarding Timeline
                </CardTitle>
                <CardDescription>Track your progress through the onboarding process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Application Started</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(clientCase.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {clientCase.status !== "Pending Submission" && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Information Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(clientCase.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {(clientCase.status === "Under Review" || clientCase.status === "Approved" || clientCase.status === "Rejected") && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Under Review</p>
                        <p className="text-sm text-muted-foreground">
                          Being reviewed by our team
                        </p>
                      </div>
                    </div>
                  )}

                  {clientCase.status === "Approved" && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Application Approved</p>
                        <p className="text-sm text-muted-foreground">
                          Your FICA application has been approved
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Center
              </CardTitle>
              <CardDescription>
                Communicate with our team and track your conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{clientMetrics.totalConversations}</div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{clientMetrics.totalMessages}</div>
                  <p className="text-sm text-muted-foreground">Messages Sent</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{clientMetrics.unreadNotifications}</div>
                  <p className="text-sm text-muted-foreground">Unread Notifications</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Recent Conversations</h4>
                {conversations
                  .filter(c => c.participants.includes(user.id))
                  .slice(0, 3)
                  .map(conv => (
                    <div key={conv.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {conv.name || `${conv.type} conversation`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last activity: {new Date(conv.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{conv.type}</Badge>
                    </div>
                  ))}
                
                {conversations.filter(c => c.participants.includes(user.id)).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No conversations yet. Our team will reach out when needed.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href="/messages">Open Message Center</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}