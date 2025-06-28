"use client";

import { useAuth } from "@/hooks/use-auth";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CasesPage() {
  const { user, isLoading, switchUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // For development: auto-switch to staff user if current user is not staff
    if (!isLoading && user && user.role !== 'staff') {
      // Find a staff user and switch to them
      switchUser('staff1'); // Switch to the default staff user
    }
  }, [user, isLoading, switchUser]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // For development: always show staff dashboard
  return <StaffDashboard />;
}