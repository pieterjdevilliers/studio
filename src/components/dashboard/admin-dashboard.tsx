"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Users, 
  FileText, 
  ClipboardList, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  Settings
} from "lucide-react";
import type { TaskStatus } from "@/types";

export function AdminDashboard() {
  const { user, users, cases, tasks, auditLogs, clientProfiles, staffProfiles } = useAuth();

  if (!user || user.role !== "admin") {
    return null;
  }

  // Calculate statistics
  const totalUsers = users.length;
  const totalClients = users.filter(u => u.role === "client").length;
  const totalStaff = users.filter(u => u.role === "staff").length;
  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status !== "Approved" && c.status !== "Rejected").length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const overdueTasks = tasks.filter(t => {
    return t.status !== "completed" && new Date(t.dueDate) < new Date();
  }).length;
  const todayAuditLogs = auditLogs.filter(log => 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const getTaskStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case "completed": return "default";
      case "in-progress": return "secondary";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  const getCaseStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Approved": return "default";
      case "Under Review": return "secondary";
      case "Additional Info Required": return "destructive";
      case "Rejected": return "destructive";
      default: return "outline";
    }
  };

  const recentTasks = tasks.slice(0, 5);
  const recentCases = cases.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Administrator Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Here's an overview of your system.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/users">
              <UserPlus className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {totalClients} clients, {totalStaff} staff
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases}</div>
            <p className="text-xs text-muted-foreground">
              of {totalCases} total cases
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {overdueTasks} overdue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAuditLogs}</div>
            <p className="text-xs text-muted-foreground">
              audit log entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      {(overdueTasks > 0 || pendingTasks > 5) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <ul className="space-y-1">
              {overdueTasks > 0 && (
                <li>• {overdueTasks} task(s) are overdue and require attention</li>
              )}
              {pendingTasks > 5 && (
                <li>• High number of pending tasks ({pendingTasks}) - consider redistributing workload</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
            <CardDescription>Latest task assignments and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => {
                const assignedUser = users.find(u => u.id === task.assignedToId);
                const isOverdue = task.status !== "completed" && new Date(task.dueDate) < new Date();
                
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned to: {assignedUser?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={getTaskStatusBadgeVariant(isOverdue ? "pending" : task.status)}>
                        {isOverdue ? "Overdue" : task.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {recentTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks found</p>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full">
                <Link href="/admin/tasks">View All Tasks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Cases
            </CardTitle>
            <CardDescription>Latest client case updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCases.map((caseItem) => {
                const assignedStaff = users.find(u => u.id === caseItem.assignedStaffId);
                
                return (
                  <div key={caseItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{caseItem.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: {caseItem.clientType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Staff: {assignedStaff?.name || "Unassigned"}
                      </p>
                    </div>
                    <Badge variant={getCaseStatusBadgeVariant(caseItem.status)}>
                      {caseItem.status}
                    </Badge>
                  </div>
                );
              })}
              {recentCases.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No cases found</p>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full">
                <Link href="/cases">View All Cases</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Link href="/admin/users">
                <Users className="h-8 w-8" />
                <span>Manage Users</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Link href="/admin/clients">
                <UserPlus className="h-8 w-8" />
                <span>Client Profiles</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Link href="/admin/tasks">
                <ClipboardList className="h-8 w-8" />
                <span>Task Management</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Link href="/admin/audit">
                <Shield className="h-8 w-8" />
                <span>Audit Logs</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}