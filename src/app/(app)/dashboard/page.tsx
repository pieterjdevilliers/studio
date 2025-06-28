"use client";

import { useAuth } from "@/hooks/use-auth";
import { EnhancedClientDashboard } from "@/components/dashboard/enhanced-client-dashboard";
import { EnhancedStaffDashboard } from "@/components/dashboard/enhanced-staff-dashboard";
import { EnhancedAdminDashboard } from "@/components/dashboard/enhanced-admin-dashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // For development: provide fallback user if none exists
  const currentUser = user || { id: "dev-user", role: "client", name: "Development User" };

  return (
    <>
      {currentUser.role === "client" && <EnhancedClientDashboard />}
      {currentUser.role === "staff" && <EnhancedStaffDashboard />}
      {currentUser.role === "admin" && <EnhancedAdminDashboard />}
    </>
  );
}