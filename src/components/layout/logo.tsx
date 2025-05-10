import Link from "next/link";
import { FileCheck2 } from "lucide-react"; // Example icon

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3">
      <FileCheck2 className="h-8 w-8 text-sidebar-primary" />
      {!collapsed && (
        <h1 className="text-2xl font-bold text-sidebar-foreground">
          FICA Flow
        </h1>
      )}
    </Link>
  );
}
