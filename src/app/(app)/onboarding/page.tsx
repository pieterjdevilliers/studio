"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClientTypeSelector } from "@/components/onboarding/client-type-selector";
import { DynamicFormFields } from "@/components/onboarding/dynamic-form-fields";
import { DocumentUploader } from "@/components/onboarding/document-uploader";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { OnboardingFormSchema, type OnboardingFormValues, IndividualSchema, CompanySchema, TrustSchema } from "@/lib/schemas";
import { getFormFieldsForClientType, getDocumentRequirementsForClientType } from "@/lib/form-config";
import type { ClientType, DocumentUpload, ClientCase, ClientFormData, DocumentRequirement, FormFieldConfig } from "@/types";
import { Loader2, Save, Send, CheckSquare, FileWarning } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { user, cases, addCase, updateCase, switchUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [clientType, setClientType] = useState<ClientType | null>(null);
  const [currentCase, setCurrentCase] = useState<ClientCase | null>(null);
  const [formFields, setFormFields] = useState<FormFieldConfig[]>([]);
  const [docRequirements, setDocRequirements] = useState<DocumentRequirement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // For development: ensure we have a client user
  useEffect(() => {
    if (user && user.role !== 'client') {
      // Switch to a client user for onboarding
      switchUser('client1');
    }
  }, [user, switchUser]);

  // Initialize or load existing case
  useEffect(() => {
    if (user) {
      const existingCase = cases.find(c => c.clientId === user.id);
      if (existingCase) {
        setCurrentCase(existingCase);
        setClientType(existingCase.clientType);
      }
    }
    // Note: Removed searchParams handling to fix Next.js error
    // Tab switching can be handled through UI interactions instead
  }, [user, cases]);

  // Update form fields and doc requirements when clientType changes
  useEffect(() => {
    if (clientType) {
      setFormFields(getFormFieldsForClientType(clientType));
      setDocRequirements(getDocumentRequirementsForClientType(clientType));
    } else {
      setFormFields([]);
      setDocRequirements([]);
    }
  }, [clientType]);

  const getCurrentSchema = useCallback(() => {
    if (!clientType) return OnboardingFormSchema;
    switch (clientType) {
      case "Individual": return IndividualSchema;
      case "Company": return CompanySchema;
      case "Trust": return TrustSchema;
      default: return OnboardingFormSchema;
    }
  }, [clientType]);

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(getCurrentSchema()),
    defaultValues: currentCase?.formData || {},
  });

  // Reset form when client type or case changes
  useEffect(() => {
    if (clientType) {
      methods.reset(currentCase?.formData && currentCase.clientType === clientType ? currentCase.formData : { clientType });
    }
  }, [clientType, currentCase, methods]);

  const handleClientTypeSelect = (type: ClientType) => {
    setClientType(type);
    if (currentCase && currentCase.clientType !== type) {
        setCurrentCase(prev => ({
            ...(prev as ClientCase),
            clientType: type,
            formData: { clientType: type },
            documents: [],
            status: "Pending Submission",
            updatedAt: new Date().toISOString(),
        }));
    } else if (!currentCase && user) {
        const newClientCase: ClientCase = {
            id: `case-${user.id}-${Date.now()}`,
            clientId: user.id,
            clientName: user.name || "New Client",
            clientType: type,
            formData: { clientType: type },
            documents: [],
            status: "Pending Submission",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setCurrentCase(newClientCase);
    }
  };

  const handleDocumentUpload = (doc: DocumentUpload) => {
    if (currentCase) {
      const updatedDocs = [...currentCase.documents, doc];
      setCurrentCase(prev => ({ ...(prev as ClientCase), documents: updatedDocs, updatedAt: new Date().toISOString() }));
    }
  };

  const handleDocumentRemove = (docId: string) => {
    if (currentCase) {
      const updatedDocs = currentCase.documents.filter(d => d.id !== docId);
      setCurrentCase(prev => ({ ...(prev as ClientCase), documents: updatedDocs, updatedAt: new Date().toISOString() }));
    }
  };
  
  const onSaveProgress = async (data: OnboardingFormValues) => {
    if (!user || !clientType || !currentCase) {
      toast({ title: "Error", description: "User or client type not set.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    const caseToSave: ClientCase = {
        ...currentCase,
        clientType,
        formData: data,
        updatedAt: new Date().toISOString(),
    };

    if (cases.find(c => c.id === caseToSave.id)) {
        updateCase(caseToSave);
    } else {
        addCase(caseToSave);
    }
    setCurrentCase(caseToSave);

    toast({ title: "Progress Saved", description: "Your onboarding information has been saved." });
    setIsSubmitting(false);
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user || !clientType || !currentCase) {
      toast({ title: "Error", description: "Cannot submit. Ensure all steps are complete.", variant: "destructive" });
      return;
    }

    const requiredDocsMet = docRequirements.every(req => 
        currentCase.documents.some(doc => doc.id.startsWith(req.id))
    );

    if (!requiredDocsMet && docRequirements.length > 0) {
        toast({ title: "Missing Documents", description: "Please upload all required documents before submitting.", variant: "destructive" });
        setActiveTab("documents");
        return;
    }

    setIsSubmitting(true);

    const finalCaseData: ClientCase = {
      ...currentCase,
      clientType,
      formData: data,
      status: "Information Submitted",
      updatedAt: new Date().toISOString(),
    };
    
    if (cases.find(c => c.id === finalCaseData.id)) {
        updateCase(finalCaseData);
    } else {
        addCase(finalCaseData);
    }
    setCurrentCase(finalCaseData);

    toast({ title: "Submission Successful", description: "Your FICA application has been submitted for review." });
    setIsSubmitting(false);
    router.push("/dashboard");
  };

  // For development: provide fallback user
  const currentUser = user || { id: "dev-client", name: "Development Client", role: "client" };

  const formProgress = currentCase?.status !== "Pending Submission" && currentCase?.status !== "Additional Info Required";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-primary">FICA Onboarding</h1>
      
      {!clientType && !currentCase?.clientType ? (
        <ClientTypeSelector onSelectType={handleClientTypeSelect} />
      ) : (
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Onboarding for: {clientType || currentCase?.clientType}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => { setClientType(null); setCurrentCase(null); methods.reset({}); }}>Change Client Type</Button>
            </div>
            <CardDescription>
              Please fill in the details and upload the required documents.
              Current Status: <span className="font-semibold">{currentCase?.status || "Not Started"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5"/> Client Details
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileWarning className="h-5 w-5"/> Document Upload
                </TabsTrigger>
              </TabsList>
              
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="details">
                    {formFields.length > 0 ? (
                      <DynamicFormFields form={methods} fieldsConfig={formFields} />
                    ) : (
                      <p>Select a client type to see the required fields.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="documents">
                    <DocumentUploader
                      requirements={docRequirements}
                      uploadedDocuments={currentCase?.documents || []}
                      onDocumentUpload={handleDocumentUpload}
                      onDocumentRemove={handleDocumentRemove}
                    />
                  </TabsContent>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={methods.handleSubmit(onSaveProgress)} 
                        disabled={isSubmitting || !clientType || formProgress}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4"/> Save Progress
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !clientType || formProgress}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send className="mr-2 h-4 w-4"/> Submit Application
                    </Button>
                  </div>
                   {formProgress && (
                        <p className="text-sm text-center text-green-600">This application has already been submitted. View status on your dashboard.</p>
                    )}
                </form>
              </FormProvider>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}