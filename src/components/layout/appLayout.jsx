import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "./appSidebar";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* <header className="flex h-14 items-center gap-2 border-b px-4 bg-[#faf3e6]"> */}
           <SidebarTrigger /> 
        {/* </header> */}
        <div className="min-w-0 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}