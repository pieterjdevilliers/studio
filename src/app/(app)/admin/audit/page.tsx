"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, Filter } from "lucide-react";
import type { AuditLog } from "@/types";

export default function AuditLogsPage() {
  const { user, auditLogs, users } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  // Only allow admin users to access this page
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users.find(u => u.id === log.userId)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    const matchesEntity = entityFilter === "all" || log.entityType === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getEntityBadgeVariant = (entityType: string) => {
    switch (entityType) {
      case "user": return "default";
      case "client": return "secondary";
      case "case": return "outline";
      case "task": return "destructive";
      case "system": return "secondary";
      default: return "outline";
    }
  };

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Audit Logs</h1>
        <p className="text-muted-foreground">Monitor all system activities and administrative actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Activity Log
          </CardTitle>
          <CardDescription>
            Complete audit trail of all user actions and system changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-md bg-card">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action.toLowerCase()}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entity Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="case">Case</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const logUser = users.find(u => u.id === log.userId);
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{logUser?.name || "Unknown User"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEntityBadgeVariant(log.entityType)}>
                          {log.entityType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate" title={log.details}>
                        {log.details}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No audit logs found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.entityType === "user").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Case Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.entityType === "case").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => 
                new Date(log.timestamp).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}