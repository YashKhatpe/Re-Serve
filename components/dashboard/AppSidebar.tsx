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
import { LayoutDashboard, Receipt, ShoppingCart, Building } from "lucide-react";
import { SheetTitle } from "../ui/sheet";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    componentId: "dashboard",
  },
  {
    title: "Generate Receipt",
    url: "/generate-receipt",
    icon: Receipt,
    componentId: "generate-receipt",
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
    componentId: "orders",
  },
];

interface AppSidebarProps {
  setActiveComponent: (component: string) => void;
  userType: "donor" | "ngo" | null;
}
export function AppSidebar({ setActiveComponent, userType }: AppSidebarProps) {
  return (
    <Sidebar className="bg-white border-r border-orange-100 pt-20">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-600 font-semibold text-base px-4">
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
                    <button
                      onClick={() => setActiveComponent(item.componentId)}
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </button>
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
