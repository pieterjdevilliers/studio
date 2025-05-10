"use client";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import type { ReactNode } from "react";

export default function AppPagesLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
