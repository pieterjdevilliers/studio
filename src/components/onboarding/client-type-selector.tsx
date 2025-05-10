"use client";

import type { ClientType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building, Users2Icon } from "lucide-react"; // Users2Icon is a placeholder if Users is taken

interface ClientTypeSelectorProps {
  onSelectType: (type: ClientType) => void;
  currentType?: ClientType | null;
}

const clientTypes: { type: ClientType; label: string; icon: React.ElementType, description: string }[] = [
  { type: "Individual", label: "Individual", icon: User, description: "For personal accounts and sole proprietors." },
  { type: "Company", label: "Company", icon: Building, description: "For registered businesses and corporations." },
  { type: "Trust", label: "Trust", icon: Users2Icon, description: "For trusts and similar legal arrangements." },
];

export function ClientTypeSelector({ onSelectType, currentType }: ClientTypeSelectorProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Select Your Client Type</CardTitle>
        <CardDescription>
          This will help us tailor the onboarding process for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {clientTypes.map(({ type, label, icon: Icon, description }) => (
          <Button
            key={type}
            variant={currentType === type ? "default" : "outline"}
            className="h-auto p-6 flex flex-col items-start text-left space-y-2 transition-all duration-200 hover:shadow-md"
            onClick={() => onSelectType(type)}
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`h-8 w-8 ${currentType === type ? 'text-primary-foreground' : 'text-primary'}`} />
              <span className="text-lg font-semibold">{label}</span>
            </div>
            <p className={`text-sm ${currentType === type ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {description}
            </p>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
