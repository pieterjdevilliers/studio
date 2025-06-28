"use client";

import { useAuth } from "@/hooks/use-auth";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CasesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'staff') {
      // Redirect non-staff users away from this page
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'staff') {
    return <p>Access Denied. Redirecting...</p>;
  }

  return <StaffDashboard />;
}