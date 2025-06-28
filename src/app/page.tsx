"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // For development: always redirect to dashboard
    if (!isLoading) {
      router.push("/dashboard");
    }
  }, [isLoading, router]);

  // For development: show loading while redirecting
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-primary">Redirecting to FICA Flow Dashboard...</p>
      <p className="mt-2 text-sm text-muted-foreground">Development Mode - Authentication Disabled</p>
    </div>
  );
}