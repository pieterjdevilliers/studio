"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/contexts/chat-context";
import { CaseListItem } from "./case-list-item";
import { CaseDetails } from "./case-details";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import type { ClientCase, CaseStatus, ClientType } from "@/types";
import { 
  FileSearch, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Users,
  Activity
} from "lucide-react";

export function EnhancedStaffDashboard() {
  const { user, cases, activeCase, setActiveCase, tasks, users } = useAuth();
  const { conversations, messages, notifications } = useChat();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all");

  if (!user) return null;

  const handleBackToList = () => {
    setActiveCase(null);
  };

  // Calculate staff metrics
  const staffMetrics = useMemo(() => {
    const assignedCases = cases.filter(c => c.assignedStaffId === user.id);
    const assignedTasks = tasks.filter(t => t.assignedToId === user.id);
    const staffConversations = conversations.filter(c => c.participants.includes(user.id));
    const unreadMessages = notifications.filter(n => n.userId === user.id && !n.isRead);
    
    return {
      totalCases: assignedCases.length,
      activeCases: assignedCases.filter(c => c.status !== "Approved" && c.status !== "Rejected").length,
      pendingTasks: assignedTasks.filter(t => t.status === "pending").length,
      completedTasks: assignedTasks.filter(t => t.status === "completed").length,
      activeConversations: staffConversations.filter(c => 
        new Date(c.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      unreadMessages: unreadMessages.length,
      completionRate: assignedTasks.length > 0 ? (assignedTasks.filter(t => t.status === "completed").length / assignedTasks.length) * 100 : 0,
    };
  }, [user.id, cases, tasks, conversations, notifications]);

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearchTerm = 
        (c.clientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.formData?.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.formData?.registeredCompanyName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.formData?.trustName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesType = typeFilter === "all" || c.clientType === typeFilter;
      return matchesSearchTerm && matchesStatus && matchesType;
    });
  }, [cases, searchTerm, statusFilter, typeFilter]);

  if (activeCase) {
    return <CaseDetails onBack={handleBackToList} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Enhanced Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Manage cases and track your performance.
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Case Management</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Staff Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Cases</CardTitle>
                <FileSearch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffMetrics.activeCases}</div>
                <p className="text-xs text-muted-foreground">
                  of {staffMetrics.totalCases} total assigned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffMetrics.pendingTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {staffMetrics.completedTasks} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffMetrics.activeConversations}</div>
                <p className="text-xs text-muted-foreground">
                  {staffMetrics.unreadMessages} unread messages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffMetrics.completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Task completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  My Performance
                </CardTitle>
                <CardDescription>Your productivity metrics and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Case Completion</span>
                    <span className="text-sm text-muted-foreground">
                      {staffMetrics.totalCases > 0 ? Math.round((cases.filter(c => c.assignedStaffId === user.id && c.status === "Approved").length / staffMetrics.totalCases) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${staffMetrics.totalCases > 0 ? (cases.filter(c => c.assignedStaffId === user.id && c.status === "Approved").length / staffMetrics.totalCases) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Task Efficiency</span>
                    <span className="text-sm text-muted-foreground">{staffMetrics.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${staffMetrics.completionRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Response Rate</span>
                    <span className="text-sm text-muted-foreground">95%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "95%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cases.filter(c => c.assignedStaffId === user.id).slice(0, 5).map(caseItem => (
                    <div key={caseItem.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{caseItem.clientName}</p>
                        <p className="text-xs text-muted-foreground">{caseItem.clientType}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {caseItem.status}
                      </Badge>
                    </div>
                  ))}
                  {cases.filter(c => c.assignedStaffId === user.id).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No assigned cases</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Case Management</CardTitle>
              <CardDescription>Manage client FICA cases and track onboarding progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-md bg-card">
                <Input 
                  placeholder="Search cases (Name, ID, Type...)" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:col-span-1"
                />
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CaseStatus | "all")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {(["Pending Submission", "Information Submitted", "Under Review", "Additional Info Required", "Approved", "Rejected"] as CaseStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ClientType | "all")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Client Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Client Types</SelectItem>
                    {(["Individual", "Company", "Trust"] as ClientType[]).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {filteredCases.length > 0 ? (
                <div className="space-y-4">
                  {filteredCases.map((caseData) => (
                    <CaseListItem key={caseData.id} caseData={caseData} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileSearch className="mx-auto h-16 w-16 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No cases found.</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Overview
              </CardTitle>
              <CardDescription>Your messaging activity and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{staffMetrics.activeConversations}</div>
                  <p className="text-sm text-muted-foreground">Active Conversations</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{staffMetrics.unreadMessages}</div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {conversations.filter(c => c.participants.includes(user.id)).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Recent Conversations</h4>
                <div className="space-y-2">
                  {conversations
                    .filter(c => c.participants.includes(user.id))
                    .slice(0, 5)
                    .map(conv => {
                      const otherParticipants = conv.participants.filter(p => p !== user.id);
                      const participantNames = otherParticipants.map(p => 
                        users.find(u => u.id === p)?.name || "Unknown"
                      ).join(", ");
                      
                      return (
                        <div key={conv.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium text-sm">
                              {conv.name || participantNames}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conv.type} • Last active: {new Date(conv.lastActivity).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{conv.type}</Badge>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}