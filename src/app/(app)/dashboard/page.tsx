"use client";

import { useAuth } from "@/hooks/use-auth";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
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

  if (!user) {
    // This should ideally be handled by AuthenticatedLayout, but as a fallback:
    return <p>Redirecting to login...</p>;
  }

  return (
    <>
      {user.role === "client" && <ClientDashboard />}
      {user.role === "staff" && <StaffDashboard />}
    </>
  );
}
