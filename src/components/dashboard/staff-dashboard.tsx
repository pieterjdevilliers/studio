"use client";

import { useAuth } from "@/hooks/use-auth";
import { CaseListItem } from "./case-list-item";
import { CaseDetails } from "./case-details";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import type { ClientCase, CaseStatus, ClientType } from "@/types";
import { FileSearch, Filter } from "lucide-react";

export function StaffDashboard() {
  const { user, cases, activeCase, setActiveCase } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all");


  if (!user) return null;

  const handleBackToList = () => {
    setActiveCase(null);
  };

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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Staff Dashboard</CardTitle>
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
    </div>
  );
}
