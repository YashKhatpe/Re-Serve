import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Receipt, ShoppingCart } from "lucide-react";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Generate Receipt",
    url: "/generate-receipt",
    icon: Receipt,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-orange-100">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-600 font-semibold text-base">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-gray-700 hover:bg-orange-50 hover:text-orange-600 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-600 text-base h-12"
                  >
                    <Link href={item.url} legacyBehavior>
                      <a>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
