/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils"
import Link from "next/link"
import React from 'react'

export type SiteBrandProps = {
  variant?: "default" | "compact",
  hideWordmark?: boolean,
  className?: string
}

export default function SiteBrand({ variant = "default", hideWordmark = false, className }: SiteBrandProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 overflow-hidden select-none", {
      "gap-2": variant === "compact",
    }, className)}>
      <img draggable={false} src="/imgs/TRACE_LOGO.svg" alt="Logo" className="shrink-0 w-[40px] h-[40px]" />
      <img draggable={false} style={{
        display: hideWordmark ? 'none' : 'block'
      }} src="/imgs/Wordmark_Color.svg" className="shrink-0 w-[110px] h-[25px]" alt="Logo" width={110} height={30} />
    </Link>
  )
}
