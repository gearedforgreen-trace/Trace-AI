/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils"
import React from 'react'


export default function SiteBrandCentered({className}: {className?: string}) {
  return (
    <div className={cn("flex items-center gap-4 overflow-hidden", className)}>
      <img draggable={false} src="/imgs/Logo_Wordmark_Center_Color.svg" alt="Logo" className="shrink-0 w-[120px] h-[70px] select-none" />
    </div>
  )
}