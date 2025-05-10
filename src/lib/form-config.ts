import type { ClientType, FormFieldConfig, DocumentRequirement } from "@/types";

export const individualFormFields: FormFieldConfig[] = [
  { name: "fullName", label: "Full Name", type: "text", required: true, placeholder: "e.g., John Doe" },
  { name: "idNumber", label: "ID Number / Passport Number", type: "text", required: true, placeholder: "Your ID or Passport number" },
  { name: "dateOfBirth", label: "Date of Birth", type: "date", placeholder: "YYYY-MM-DD" },
  { name: "residentialAddress", label: "Residential Address", type: "textarea", required: true, placeholder: "Street, City, Postal Code" },
  { name: "contactNumber", label: "Contact Number", type: "tel", placeholder: "+27 12 345 6789" },
  { name: "taxNumber", label: "Tax Number (Optional)", type: "text", placeholder: "Your tax identification number" },
  { name: "sourceOfFunds", label: "Source of Funds/Wealth (Optional)", type: "text", placeholder: "e.g., Salary, Business Income" },
];

export const companyFormFields: FormFieldConfig[] = [
  { name: "registeredCompanyName", label: "Registered Company Name", type: "text", required: true },
  { name: "registrationNumber", label: "Company Registration Number", type: "text", required: true },
  { name: "tradingName", label: "Trading Name (if different)", type: "text" },
  { name: "registeredAddress", label: "Registered Address", type: "textarea", required: true },
  { name: "businessAddress", label: "Business Address (if different)", type: "textarea" },
  { name: "companyContactNumber", label: "Company Contact Number", type: "tel" },
  { name: "companyTaxNumber", label: "Company Tax Number", type: "text" },
  { name: "vatNumber", label: "VAT Number (if applicable)", type: "text" },
  { name: "directors", label: "Details of Directors (Names & ID Numbers)", type: "textarea", placeholder: "e.g., Jane Smith (ID: 987654321), Tom Brown (ID: 123123123)" },
  { name: "shareholders", label: "Details of Shareholders (>25% UBOs - Names & ID Numbers or Entity Details)", type: "textarea", placeholder: "e.g., UBO One (ID: 555444333) - 30%, Entity ABC (Reg: 2022/123/07) - 40%" },
];

export const trustFormFields: FormFieldConfig[] = [
  { name: "trustName", label: "Name of Trust", type: "text", required: true },
  { name: "trustRegistrationNumber", label: "Trust Registration Number (Master of High Court)", type: "text", required: true },
  { name: "trustType", label: "Type of Trust", type: "text", placeholder: "e.g., Discretionary, Testamentary" },
  { name: "founderDetails", label: "Details of Founder (Name & ID Number or Entity Details)", type: "textarea" },
  { name: "trusteeDetails", label: "Details of all Trustees (Names & ID Numbers)", type: "textarea", required: true, placeholder: "e.g., Trustee A (ID: 111222333), Trustee B (ID: 444555666)" },
  { name: "beneficiaryDetails", label: "Details of Beneficiaries (especially vested rights/significant control)", type: "textarea" },
  { name: "trustSourceOfFunds", label: "Source of Funds of the Trust", type: "text" },
  { name: "trustAddress", label: "Physical Address of the Trust", type: "textarea" },
];

export const individualDocumentRequirements: DocumentRequirement[] = [
  { id: "certifiedId", name: "Certified ID Document", description: "SA ID card/book, or Passport for foreign nationals. Must be certified and not older than 3 months.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
  { id: "proofOfAddress", name: "Proof of Residential Address", description: "Utility bill, bank statement, lease agreement. Not older than 3 months.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
  { id: "proofOfIncome", name: "Proof of Income/Source of Funds (If applicable)", description: "Payslip, bank statement showing income.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
  { id: "bankConfirmation", name: "Bank Confirmation Letter (If applicable)", description: "Official letter from your bank confirming your account details.", fileTypes: ["application/pdf"] },
];

export const companyDocumentRequirements: DocumentRequirement[] = [
  { id: "companyRegistrationCert", name: "Company Registration Certificate (e.g., CoR 14.3)", description: "Official company registration document.", fileTypes: ["application/pdf"] },
  { id: "noticeOfRegisteredAddress", name: "Notice of Registered Address (CoR 21.1)", description: "Document confirming the company's registered address.", fileTypes: ["application/pdf"] },
  { id: "proofOfBusinessAddress", name: "Proof of Business Address", description: "Utility bill or lease agreement for the business premises. Not older than 3 months.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
  { id: "proofOfCompanyBankAccount", name: "Proof of Company Bank Account", description: "Bank statement or confirmation letter for the company account.", fileTypes: ["application/pdf"] },
  { id: "resolutionNominatingRep", name: "Resolution Nominating Authorised Representative", description: "Company resolution authorising an individual to act on its behalf.", fileTypes: ["application/pdf"] },
  { id: "directorFica", name: "FICA for all Directors", description: "Certified ID and Proof of Address for each director (upload as separate files or a combined PDF per director).", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
  { id: "shareholderFica", name: "FICA for Shareholders (>25% UBOs)", description: "FICA documents for individuals or entities holding >25% shares.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
  { id: "financialStatements", name: "Latest Annual Financial Statements (If applicable)", description: "Most recent AFS.", fileTypes: ["application/pdf"] },
  { id: "orgChart", name: "Organisational Chart (For complex structures)", description: "Chart showing ownership structure to identify UBOs.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
];

export const trustDocumentRequirements: DocumentRequirement[] = [
  { id: "trustDeed", name: "Trust Deed (or other founding document)", description: "The legal document establishing the trust.", fileTypes: ["application/pdf"] },
  { id: "letterOfAuthority", name: "Letter of Authority (Master of High Court)", description: "Official letter authorising trustees to act.", fileTypes: ["application/pdf"] },
  { id: "resolutionNominatingRepTrust", name: "Resolution Nominating Authorised Representative", description: "Trust resolution authorising an individual to act on its behalf.", fileTypes: ["application/pdf"] },
  { id: "proofOfTrustBankAccount", name: "Proof of Trust's Bank Account", description: "Bank statement or confirmation letter for the trust account.", fileTypes: ["application/pdf"] },
  { id: "proofOfAddressTrust", name: "Proof of Address for the Trust", description: "Utility bill or similar for the trust's address. Not older than 3 months.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
  { id: "founderFica", name: "FICA for Founder", description: "Certified ID and Proof of Address for the founder.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
  { id: "trusteeFica", name: "FICA for all Trustees", description: "Certified ID and Proof of Address for each trustee.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
  { id: "beneficiaryFica", name: "FICA for Beneficiaries (If applicable)", description: "FICA for beneficiaries with vested rights or significant influence.", fileTypes: ["application/pdf", "image/jpeg", "image/png"] },
];


export const getFormFieldsForClientType = (clientType: ClientType | null): FormFieldConfig[] => {
  if (!clientType) return [];
  switch (clientType) {
    case "Individual": return individualFormFields;
    case "Company": return companyFormFields;
    case "Trust": return trustFormFields;
    default: return [];
  }
};

export const getDocumentRequirementsForClientType = (clientType: ClientType | null): DocumentRequirement[] => {
  if (!clientType) return [];
  switch (clientType) {
    case "Individual": return individualDocumentRequirements;
    case "Company": return companyDocumentRequirements;
    case "Trust": return trustDocumentRequirements;
    default: return [];
  }
};
