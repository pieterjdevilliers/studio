import { z } from "zod";
import type { ClientType } from "@/types";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["client", "staff"]),
});

const BaseClientInfoSchema = z.object({
  clientType: z.custom<ClientType>((val) => val === "Individual" || val === "Company" || val === "Trust", "Invalid client type"),
});

export const IndividualSchema = BaseClientInfoSchema.extend({
  fullName: z.string().min(2, "Full name is required."),
  idNumber: z.string().min(5, "ID number is required."),
  dateOfBirth: z.string().optional(), // Consider using a date type if date picker is robust
  residentialAddress: z.string().min(5, "Residential address is required."),
  contactNumber: z.string().min(5, "Contact number is required.").optional(),
  taxNumber: z.string().optional(),
  sourceOfFunds: z.string().optional(),
});

export const CompanySchema = BaseClientInfoSchema.extend({
  registeredCompanyName: z.string().min(2, "Company name is required."),
  registrationNumber: z.string().min(5, "Registration number is required."),
  tradingName: z.string().optional(),
  registeredAddress: z.string().min(5, "Registered address is required."),
  businessAddress: z.string().optional(),
  companyContactNumber: z.string().min(5, "Contact number is required.").optional(),
  companyTaxNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  directors: z.string().optional().describe("Details of Directors"), // Simplified
  shareholders: z.string().optional().describe("Details of UBOs (>25% shareholding)"), // Simplified
});

export const TrustSchema = BaseClientInfoSchema.extend({
  trustName: z.string().min(2, "Trust name is required."),
  trustRegistrationNumber: z.string().min(5, "Registration number is required."),
  trustType: z.string().optional(),
  founderDetails: z.string().optional(),
  trusteeDetails: z.string().min(5, "Trustee details are required."), // Simplified
  beneficiaryDetails: z.string().optional(), // Simplified
  trustSourceOfFunds: z.string().optional(),
  trustAddress: z.string().min(5, "Trust address is required.").optional(),
});

// A discriminated union for onboarding forms
export const OnboardingFormSchema = z.discriminatedUnion("clientType", [
  IndividualSchema.extend({ clientType: z.literal("Individual") }),
  CompanySchema.extend({ clientType: z.literal("Company") }),
  TrustSchema.extend({ clientType: z.literal("Trust") }),
]);

export type LoginFormValues = z.infer<typeof LoginSchema>;
export type RegisterFormValues = z.infer<typeof RegisterSchema>;
export type OnboardingFormValues = z.infer<typeof OnboardingFormSchema>;
export type IndividualFormValues = z.infer<typeof IndividualSchema>;
export type CompanyFormValues = z.infer<typeof CompanySchema>;
export type TrustFormValues = z.infer<typeof TrustSchema>;
