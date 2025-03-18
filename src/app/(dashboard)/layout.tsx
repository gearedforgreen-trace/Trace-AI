import { AppSidebar } from "./_components/app-sidebar"
import FloatingMenuTrigger from "./_components/floating-menu-trigger"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (  
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative">
        <FloatingMenuTrigger />
        <div className="sm:p-12 p-5 max-sm:pt-10">
          {children}         
        </div>
      </SidebarInset>
    </SidebarProvider>  
  )
}
