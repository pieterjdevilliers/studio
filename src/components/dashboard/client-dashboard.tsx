"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, CheckCircle2, AlertTriangle, MessageSquare, Hourglass } from "lucide-react";
import type { ClientCase } from "@/types";

export function ClientDashboard() {
  const { user, cases } = useAuth();

  if (!user) return null;

  const clientCase = cases.find(c => c.clientId === user.id); // Assuming one case per client for now

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

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {user.name || "Client"}!</CardTitle>
          <CardDescription>
            Here&apos;s an overview of your FICA onboarding process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clientCase ? (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Onboarding Status</h3>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                  {getStatusIcon(clientCase.status)}
                  <span>{clientCase.status}</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Your application for <span className="font-medium text-foreground">{clientCase.clientType}</span> FICA is currently <span className="font-medium text-foreground">{clientCase.status.toLowerCase()}</span>.
              </p>
              {clientCase.status === "Pending Submission" && (
                 <p className="text-sm text-muted-foreground">
                    Please complete your onboarding information and submit your documents.
                </p>
              )}
              {clientCase.status === "Additional Info Required" && (
                <p className="text-sm text-yellow-600">
                  We need some more information. Please check your messages or update your submission.
                </p>
              )}
               {clientCase.status !== "Approved" && clientCase.status !== "Rejected" && (
                <Button asChild>
                  <Link href="/onboarding">
                    {clientCase.status === "Pending Submission" ? "Start Onboarding" : "View/Update Onboarding"}
                  </Link>
                </Button>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">My Documents</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              View and manage your uploaded documents.
            </p>
            <Button variant="outline" asChild>
              <Link href="/onboarding?tab=documents">Manage Documents</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Messages</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Check for communications from our onboarding team. (Feature coming soon)
            </p>
            <Button variant="outline" disabled>View Messages</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
