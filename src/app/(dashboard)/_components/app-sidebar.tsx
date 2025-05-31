"use client";

import type * as React from "react";
import SiteBrand from "@/components/site-brand";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AnalyticsIcon,
  UsersIcon,
  CouponsIcon,
  StoreIcon,
  QRCodesBinsIcon,
  RewardPointsIcon,
  DashboardIcon,
  BinIcon,
  MaterialsIcon,
  OrganizationsIcon,
} from "@/components/icons/sidebar-icons";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// This is sample data.
const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://avatars.githubusercontent.com/u/124599?v=4",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <DashboardIcon />,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: <AnalyticsIcon />,
    },
    {
      title: "Organizations",
      url: "/organizations",
      icon: <OrganizationsIcon />,
    },
    {
      title: "Users",
      url: "/users",
      icon: <UsersIcon />,
    },
    {
      title: "Stores",
      url: "/stores",
      icon: <StoreIcon />,
    },
    {
      title: "Bins",
      url: "/bins",
      icon: <BinIcon />,
    },
    {
      title: "Materials",
      url: "/materials",
      icon: <MaterialsIcon />,
    },
    {
      title: "Reward Rules",
      url: "/reward-rules",
      icon: <RewardPointsIcon />,
    },
    {
      title: "Coupons",
      url: "/coupons",
      icon: <CouponsIcon />,
    },
 
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader className="pb-0">
        <SiteBrand
          className={cn({
            "p-2": !isCollapsed,
            "p-0.5": isCollapsed,
            "justify-center": isCollapsed,
          })}
          hideWordmark={isCollapsed}
        />
      </SidebarHeader>
      <Separator className="mt-3 " />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
