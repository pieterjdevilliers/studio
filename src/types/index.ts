export type UserRole = "client" | "staff"; // Simplified roles: OnboardingOfficer, ComplianceOfficer, Administrator are all 'staff'

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export type ClientType = "Individual" | "Company" | "Trust";

export interface DocumentUpload {
  id: string;
  name: string;
  type: string; // MIME type
  dataUrl: string; // base64 encoded data URI
  required?: boolean;
  description?: string; // e.g. "Certified ID Copy - not older than 3 months"
}

export interface IndividualData {
  fullName?: string;
  idNumber?: string;
  dateOfBirth?: string;
  residentialAddress?: string;
  contactNumber?: string;
  taxNumber?: string;
  sourceOfFunds?: string;
}

export interface CompanyData {
  registeredCompanyName?: string;
  registrationNumber?: string;
  tradingName?: string;
  registeredAddress?: string;
  businessAddress?: string;
  companyContactNumber?: string;
  companyTaxNumber?: string;
  vatNumber?: string;
  // Simplified director/shareholder info for now
  directors?: string; // Could be array of objects
  shareholders?: string; // Could be array of objects
}

export interface TrustData {
  trustName?: string;
  trustRegistrationNumber?: string;
  trustType?: string;
  founderDetails?: string;
  trusteeDetails?: string; // Could be array of objects
  beneficiaryDetails?: string; // Could be array of objects
  trustSourceOfFunds?: string;
  trustAddress?: string;
}

export type ClientFormData = IndividualData | CompanyData | TrustData;

export type CaseStatus =
  | "Pending Submission"
  | "Information Submitted"
  | "Under Review"
  | "Additional Info Required"
  | "Approved"
  | "Rejected";

export interface ClientCase {
  id: string;
  clientId: string; // User ID of the client
  clientName?: string; // Name of the client or company/trust
  clientType: ClientType | null;
  formData: Partial<ClientFormData>;
  documents: DocumentUpload[];
  status: CaseStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  riskAssessment?: {
    riskLevel: "Low" | "Medium" | "High";
    confidenceScore: number;
    reasoning: string;
    assessedAt: string;
  };
}

// For dynamic form generation
export interface FormFieldConfig {
  name: keyof IndividualData | keyof CompanyData | keyof TrustData;
  label: string;
  type: "text" | "date" | "textarea" | "email" | "tel";
  required?: boolean;
  placeholder?: string;
}

export interface DocumentRequirement {
  id: string; // e.g., 'certifiedId'
  name: string; // e.g., 'Certified ID Copy'
  description: string;
  fileTypes: string[]; // e.g., ['application/pdf', 'image/jpeg', 'image/png']
}
