"use client";

import type { ClientCase } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Building, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface CaseListItemProps {
  caseData: ClientCase;
}

export function CaseListItem({ caseData }: CaseListItemProps) {
  const { setActiveCase } = useAuth();

  const getClientTypeIcon = (clientType: ClientCase["clientType"]) => {
    if (clientType === "Individual") return <User className="h-5 w-5 text-primary" />;
    if (clientType === "Company") return <Building className="h-5 w-5 text-primary" />;
    if (clientType === "Trust") return <Users className="h-5 w-5 text-primary" />;
    return null;
  };

  const getStatusVariant = (status: ClientCase["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Approved": return "default"; // Greenish if customized, otherwise primary
      case "Under Review": return "secondary";
      case "Additional Info Required": return "outline"; // Yellowish if customized
      case "Rejected": return "destructive";
      default: return "secondary";
    }
  };
  
  // A simple way to get a name, fallback to ID
  const displayName = caseData.clientName || caseData.formData?.fullName || caseData.formData?.registeredCompanyName || caseData.formData?.trustName || `Client ID: ${caseData.clientId.substring(0,8)}`;


  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getClientTypeIcon(caseData.clientType)}
            {displayName}
          </CardTitle>
          <Badge variant={getStatusVariant(caseData.status)}>{caseData.status}</Badge>
        </div>
        <CardDescription>
          Case ID: {caseData.id.substring(0,8)} | Last Updated: {new Date(caseData.updatedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Client Type: <span className="font-medium text-foreground">{caseData.clientType}</span></p>
            <p className="text-sm text-muted-foreground">Documents: <span className="font-medium text-foreground">{caseData.documents.length} uploaded</span></p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveCase(caseData)}>
            View Case <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
