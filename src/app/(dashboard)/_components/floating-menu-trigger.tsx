'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export default function FloatingMenuTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <div className="bg-card fixed top-1 left-1 rounded-full shadow-md">
      <Button variant="ghost" className="hover:bg-transparent" size="icon" onClick={toggleSidebar}>
        <Menu />
      </Button>
    </div>
  );
}
