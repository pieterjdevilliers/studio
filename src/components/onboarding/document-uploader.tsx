"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadCloud, FileText, XCircle, CheckCircle2, Paperclip } from "lucide-react";
import type { DocumentRequirement, DocumentUpload } from "@/types";
import { Progress } from "@/components/ui/progress";

interface DocumentUploaderProps {
  requirements: DocumentRequirement[];
  uploadedDocuments: DocumentUpload[];
  onDocumentUpload: (doc: DocumentUpload) => void;
  onDocumentRemove: (docId: string) => void;
}

export function DocumentUploader({ requirements, uploadedDocuments, onDocumentUpload, onDocumentRemove }: DocumentUploaderProps) {
  const [uploadingFile, setUploadingFile] = useState<string | null>(null); // Store ID of file being uploaded
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, requirement: DocumentRequirement) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!requirement.fileTypes.includes(file.type)) {
      alert(`Invalid file type for ${requirement.name}. Allowed types: ${requirement.fileTypes.join(", ")}`);
      return;
    }
    // Max file size (e.g., 5MB) - optional
    if (file.size > 5 * 1024 * 1024) {
        alert(`File size exceeds 5MB limit for ${requirement.name}.`);
        return;
    }

    setUploadingFile(requirement.id);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (event) => {
        if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
        }
    };
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      onDocumentUpload({
        id: `${requirement.id}-${Date.now()}`, // Ensure unique ID for multiple uploads of same requirement
        name: file.name,
        type: file.type,
        dataUrl,
        description: requirement.description, // or file.name
      });
      setUploadingFile(null);
      setUploadProgress(0);
       // Reset file input to allow re-upload of the same file name
      if (event.target) {
        event.target.value = ""; 
      }
    };
    reader.onerror = () => {
        alert(`Error reading file ${file.name}.`);
        setUploadingFile(null);
        setUploadProgress(0);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Upload Required Documents</CardTitle>
        <CardDescription>
          Please upload the following documents. Ensure they are clear and meet the requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {requirements.map((req) => {
          const currentUploads = uploadedDocuments.filter(doc => doc.id.startsWith(req.id));
          const isCurrentlyUploading = uploadingFile === req.id;

          return (
            <div key={req.id} className="p-4 border rounded-lg bg-secondary/30 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-primary"/>
                    {req.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{req.description}</p>
                  <p className="text-xs text-muted-foreground">Allowed types: {req.fileTypes.map(ft => ft.split('/')[1]).join(", ").toUpperCase()}</p>
                </div>
                {!isCurrentlyUploading && (
                    <Button asChild variant="outline" size="sm">
                        <label htmlFor={req.id} className="cursor-pointer">
                            <UploadCloud className="mr-2 h-4 w-4" /> Upload File
                            <Input
                            id={req.id}
                            type="file"
                            className="hidden"
                            accept={req.fileTypes.join(",")}
                            onChange={(e) => handleFileChange(e, req)}
                            />
                        </label>
                    </Button>
                )}
              </div>

              {isCurrentlyUploading && (
                <div className="my-2">
                  <Progress value={uploadProgress} className="h-2 w-full" />
                  <p className="text-xs text-primary text-center mt-1">Uploading {uploadingFile === req.id ? '...' : ''}</p>
                </div>
              )}

              {currentUploads.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Uploaded file(s):</p>
                  {currentUploads.map(doc => (
                    <Alert key={doc.id} className="flex items-center justify-between p-2 bg-background">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            <div className="truncate">
                                <AlertDescription className="text-sm font-medium text-foreground truncate" title={doc.name}>{doc.name}</AlertDescription>
                                <p className="text-xs text-muted-foreground">{(doc.dataUrl.length * 0.75 / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onDocumentRemove(doc.id)} title="Remove file">
                            <XCircle className="h-5 w-5 text-red-500" />
                        </Button>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          );
        })}
         {requirements.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No specific document requirements for this client type, or an error occurred.</p>
        )}
      </CardContent>
    </Card>
  );
}
