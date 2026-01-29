import React, { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuthStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      // Check local storage for persistence
      const saved = localStorage.getItem('auth_user');
      if (!saved) navigate('/login');
    }
  }, [user, navigate]);
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={className}>
        <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="h-6 w-px bg-border" />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm font-medium">
              {user?.role === 'WARGA' ? 'Resident Portal' : user?.role === 'TPU' ? 'Collector Workspace' : 'Command Center'}
            </span>
          </div>
        </div>
        {container ? (
          <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
            {children}
          </div>
        ) : (
          children
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}