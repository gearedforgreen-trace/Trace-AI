import { AppSidebar } from './_components/app-sidebar';
import FloatingMenuTrigger from './_components/floating-menu-trigger';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { getSession } from '@/lib/servers/sessions';
import { redirect } from 'next/navigation';
import UnauthorizedDashboard from '@/components/UnauthorizedDashboard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;  
}) {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.role !== 'admin') {
    return <UnauthorizedDashboard />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative">
        <FloatingMenuTrigger />
        <div className="sm:p-12 p-5 max-sm:pt-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
