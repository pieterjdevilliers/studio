"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormFieldConfig } from "@/lib/form-config";
import type { OnboardingFormValues } from "@/lib/schemas";

interface DynamicFormFieldsProps {
  form: UseFormReturn<any>; // Using any for flexibility with discriminated union
  fieldsConfig: FormFieldConfig[];
}

export function DynamicFormFields({ form, fieldsConfig }: DynamicFormFieldsProps) {
  return (
    <>
      {fieldsConfig.map((fieldConfig) => (
        <FormField
          key={fieldConfig.name}
          control={form.control}
          name={fieldConfig.name as keyof OnboardingFormValues}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fieldConfig.label}{fieldConfig.required && <span className="text-destructive">*</span>}</FormLabel>
              <FormControl>
                {fieldConfig.type === "textarea" ? (
                  <Textarea placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label.toLowerCase()}`} {...field} />
                ) : (
                  <Input 
                    type={fieldConfig.type} 
                    placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label.toLowerCase()}`} 
                    {...field} 
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
}
