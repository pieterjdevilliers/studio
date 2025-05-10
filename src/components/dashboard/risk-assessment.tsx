"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ShieldCheck, ShieldAlert, ShieldQuestion, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { suggestRiskLevel, type SuggestRiskLevelInput, type SuggestRiskLevelOutput } from "@/ai/flows/suggest-risk-level";
import type { ClientCase, ClientFormData, DocumentUpload } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface RiskAssessmentProps {
  caseData: ClientCase;
  onAssessmentComplete: (assessmentResult: SuggestRiskLevelOutput) => void;
}

export function RiskAssessment({ caseData, onAssessmentComplete }: RiskAssessmentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<SuggestRiskLevelOutput | null>(caseData.riskAssessment ? {
    riskLevel: caseData.riskAssessment.riskLevel,
    confidenceScore: caseData.riskAssessment.confidenceScore,
    reasoning: caseData.riskAssessment.reasoning,
  } : null);
  const { toast } = useToast();

  const handleAssessRisk = async () => {
    setIsLoading(true);
    setAssessmentResult(null);

    if (!caseData.clientType) {
        toast({ title: "Error", description: "Client type is missing.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    const clientInformation = formatClientInformation(caseData.formData, caseData.clientType);
    const uploadedDocuments = caseData.documents.map(doc => doc.dataUrl);

    if (uploadedDocuments.length === 0) {
        toast({ title: "Warning", description: "No documents uploaded for assessment.", variant: "destructive" });
        // Allow assessment without documents if needed, or return
    }
    
    const input: SuggestRiskLevelInput = {
      clientType: caseData.clientType,
      clientInformation,
      uploadedDocuments,
    };

    try {
      const result = await suggestRiskLevel(input);
      setAssessmentResult(result);
      onAssessmentComplete(result);
      toast({ title: "Risk Assessment Complete", description: `Suggested Risk: ${result.riskLevel}` });
    } catch (error) {
      console.error("Risk assessment failed:", error);
      toast({ title: "Error", description: "Risk assessment failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatClientInformation = (formData: Partial<ClientFormData>, clientType: ClientCase["clientType"]): string => {
    let infoString = `Client Type: ${clientType}. `;
    for (const [key, value] of Object.entries(formData)) {
      if (value) {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        infoString += `${formattedKey}: ${value}. `;
      }
    }
    return infoString.trim();
  };

  const getRiskIcon = (riskLevel?: "Low" | "Medium" | "High") => {
    if (!riskLevel) return <ShieldQuestion className="h-8 w-8 text-muted-foreground" />;
    switch (riskLevel) {
      case "Low": return <ShieldCheck className="h-8 w-8 text-green-500" />;
      case "Medium": return <ShieldAlert className="h-8 w-8 text-yellow-500" />;
      case "High": return <ShieldAlert className="h-8 w-8 text-red-500" />; // Consider a different icon for High if ShieldAlert is too generic
      default: return <ShieldQuestion className="h-8 w-8 text-muted-foreground" />;
    }
  };
  
  const getRiskColor = (riskLevel?: "Low" | "Medium" | "High") => {
    if (!riskLevel) return "text-muted-foreground";
    switch (riskLevel) {
      case "Low": return "text-green-500";
      case "Medium": return "text-yellow-500";
      case "High": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Risk Assessment</CardTitle>
        <CardDescription>
          Suggests a risk level based on client information and documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Assessing risk...</p>
          </div>
        )}

        {!isLoading && assessmentResult && (
          <div className="space-y-3 p-4 border rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              {getRiskIcon(assessmentResult.riskLevel)}
              <div>
                <p className={`text-xl font-semibold ${getRiskColor(assessmentResult.riskLevel)}`}>
                  {assessmentResult.riskLevel} Risk
                </p>
                 <p className="text-sm text-muted-foreground">Confidence: {(assessmentResult.confidenceScore * 100).toFixed(0)}%</p>
              </div>
            </div>
            <Progress value={assessmentResult.confidenceScore * 100} className="h-2" />
            <div>
              <h4 className="font-medium text-sm">Reasoning:</h4>
              <p className="text-xs text-muted-foreground bg-background p-2 rounded whitespace-pre-wrap">
                {assessmentResult.reasoning}
              </p>
            </div>
          </div>
        )}

        {!isLoading && (
          <Button onClick={handleAssessRisk} className="w-full" disabled={isLoading || !caseData.clientType}>
            <TrendingUp className="mr-2 h-4 w-4" />
            {assessmentResult ? "Re-assess Risk" : "Assess Risk"}
          </Button>
        )}
         {!caseData.clientType && <p className="text-xs text-red-500 text-center">Client type must be selected before assessment.</p>}
      </CardContent>
    </Card>
  );
}
