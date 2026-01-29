import React from "react";
import {
  LayoutDashboard,
  Truck,
  History,
  PlusCircle,
  BarChart3,
  Users,
  LogOut,
  Recycle,
  Map as MapIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
export function AppSidebar(): JSX.Element {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const getMenuItems = () => {
    if (user?.role === 'WARGA') {
      return [
        { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
        { title: "History", icon: History, url: "/history" },
      ];
    }
    if (user?.role === 'TPU') {
      return [
        { title: "Job Map", icon: MapIcon, url: "/tpu/map" },
        { title: "Active Tasks", icon: Truck, url: "/workspace" },
        { title: "Earnings", icon: BarChart3, url: "/workspace" },
      ];
    }
    return [
      { title: "Command Center", icon: BarChart3, url: "/admin" },
      { title: "Users", icon: Users, url: "/admin" },
    ];
  };
  const menuItems = getMenuItems();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Recycle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">RecycleYuk</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-1">Logistics</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link to={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium truncate max-w-[120px]">{user?.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}