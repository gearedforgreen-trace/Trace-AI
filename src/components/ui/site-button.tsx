import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive font-bold tracking-wide",
  {
    variants: {
      variant: {
        solid: "",
        outline: "border bg-background shadow-xs hover:bg-accent/10 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ghost: "hover:bg-accent/10 dark:hover:bg-accent/50",
        link: "underline-offset-4 hover:underline",
      },
      color: {
        primary: "text-primary-foreground [&:not(.outline)]:bg-primary [&:not(.outline)]:hover:bg-primary/90",
        primaryDark: "text-primary-dark-foreground [&:not(.outline)]:bg-primary-dark [&:not(.outline)]:hover:bg-primary-dark/90",
        primaryLight: "text-primary-light-foreground [&:not(.outline)]:bg-primary-light [&:not(.outline)]:hover:bg-primary-light/90",
        gradient: "text-primary-foreground [&:not(.outline)]:bg-gradient-to-r [&:not(.outline)]:from-primary [&:not(.outline)]:to-primary-dark hover:opacity-90",
        destructive: "text-destructive-foreground [&:not(.outline)]:bg-destructive [&:not(.outline)]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive-foreground",
        secondary: "text-secondary-foreground [&:not(.outline)]:bg-secondary [&:not(.outline)]:hover:bg-secondary/80",
        muted: "text-muted-foreground [&:not(.outline)]:bg-muted [&:not(.outline)]:hover:bg-muted/80",
      },
      size: {
        md: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-sm",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4",
        iconMd: "size-10",
        iconSm: "size-8.5",
        iconLg: "size-12",
      },
    },
    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "md",
    },
  }
)

function SiteButton({
  className,
  variant,
  size,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, color, className }))}
      {...props}
    />
  )
}

export { SiteButton, buttonVariants }
