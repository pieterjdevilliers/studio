"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LayoutDashboard, FileText, Users, Settings, LogOut, FilePlus, UserCheck, Shield, ClipboardList, UserCog, MessageSquare } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";
import { Logo } from "./logo";
import { ChatWidget } from "@/components/chat/chat-widget";
import Link from "next/link";
import { Button } from "../ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: ("client" | "staff" | "admin")[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["client", "staff", "admin"] },
  { href: "/onboarding", label: "My Onboarding", icon: FilePlus, roles: ["client"] },
  { href: "/messages", label: "Messages", icon: MessageSquare, roles: ["client", "staff", "admin"] },
  { href: "/cases", label: "Client Cases", icon: FileText, roles: ["staff", "admin"] },
  { href: "/admin/users", label: "User Management", icon: Users, roles: ["admin"] },
  { href: "/admin/clients", label: "Client Management", icon: UserCog, roles: ["admin"] },
  { href: "/admin/tasks", label: "Task Management", icon: ClipboardList, roles: ["admin"] },
  { href: "/admin/audit", label: "Audit Logs", icon: Shield, roles: ["admin"] },
  { href: "/admin/settings", label: "System Settings", icon: Settings, roles: ["admin"] },
];

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-primary">Loading FICA Flow...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar userRole={user?.role || "client"} onLogout={logout} />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
        <ChatWidget />
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppHeader() {
  const { isMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center">
        {isMobile && <SidebarTrigger />}
      </div>
      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}

function AppSidebar({ userRole, onLogout }: { userRole: "client" | "staff" | "admin", onLogout: () => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo collapsed={collapsed} />
        {!collapsed && <SidebarTrigger className="hidden md:flex ml-auto" />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  tooltip={item.label}
                  asChild
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout} tooltip="Log Out">
                    <LogOut />
                    <span>Log Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}