"use client";

import type { ClientCase, ClientFormData, DocumentUpload, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Check, Edit3, Eye, FileText, MessageSquare, Download, ShieldAlert, UserCircle2, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { RiskAssessment } from "./risk-assessment";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { type SuggestRiskLevelOutput } from "@/ai/flows/suggest-risk-level";

interface CaseDetailsProps {
  onBack: () => void;
}

export function CaseDetails({ onBack }: CaseDetailsProps) {
  const { activeCase, updateCase, users } = useAuth();

  if (!activeCase) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No case selected or case data is unavailable.</AlertDescription>
      </Alert>
    );
  }
  
  const clientUser = users.find(u => u.id === activeCase.clientId);

  const handleRiskAssessmentComplete = (assessmentResult: SuggestRiskLevelOutput) => {
    const updatedCaseData: ClientCase = {
      ...activeCase,
      riskAssessment: {
        ...assessmentResult,
        assessedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    updateCase(updatedCaseData);
  };

  const handleStatusChange = (newStatus: ClientCase["status"]) => {
    const updatedCaseData: ClientCase = {
      ...activeCase,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    updateCase(updatedCaseData);
  };
  
  const renderFormData = (formData: Partial<ClientFormData>) => {
    return Object.entries(formData)
      .filter(([key]) => key !== 'clientType') // Already shown
      .map(([key, value]) => {
        if (!value) return null;
        //Format key from camelCase to Title Case
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return (
          <div key={key} className="grid grid-cols-3 gap-2 py-1 text-sm">
            <span className="font-medium text-muted-foreground">{label}:</span>
            <span className="col-span-2 text-foreground">{String(value)}</span>
          </div>
        );
      });
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl mb-2 sm:mb-0">Case Details: {activeCase.id.substring(0, 8)}</CardTitle>
            <div className="flex gap-2 items-center">
                 <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    activeCase.status === "Approved" ? "bg-green-100 text-green-700" :
                    activeCase.status === "Rejected" ? "bg-red-100 text-red-700" :
                    activeCase.status === "Additional Info Required" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                }`}>
                    {activeCase.status}
                </span>
            </div>
          </div>
          <CardDescription>
            Client: {clientUser?.name || activeCase.clientName || 'N/A'} ({clientUser?.email || 'N/A'}) | Type: {activeCase.clientType}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCircle2 className="h-5 w-5 text-primary" /> Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderFormData(activeCase.formData)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Submitted Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeCase.documents.length > 0 ? (
                  <ul className="space-y-3">
                    {activeCase.documents.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-secondary/30">
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} - {(doc.dataUrl.length * 0.75 / 1024).toFixed(2)} KB</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" title="Preview (mock)">
                            <Eye className="h-4 w-4" />
                          </Button>
                           <a href={doc.dataUrl} download={doc.name} title="Download">
                            <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                           </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents submitted yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <RiskAssessment caseData={activeCase} onAssessmentComplete={handleRiskAssessmentComplete} />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" onClick={() => handleStatusChange("Approved")} disabled={activeCase.status === "Approved"}>
                  <Check className="mr-2 h-4 w-4 text-green-500" /> Mark as Approved
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleStatusChange("Rejected")} disabled={activeCase.status === "Rejected"}>
                  <X className="mr-2 h-4 w-4 text-red-500" /> Mark as Rejected
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleStatusChange("Additional Info Required")} disabled={activeCase.status === "Additional Info Required"}>
                  <Edit3 className="mr-2 h-4 w-4 text-yellow-500" /> Request Additional Info
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <MessageSquare className="mr-2 h-4 w-4" /> Send Message to Client
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
            Created: {new Date(activeCase.createdAt).toLocaleString()} | Last Updated: {new Date(activeCase.updatedAt).toLocaleString()}
        </CardFooter>
      </Card>
    </div>
  );
}
