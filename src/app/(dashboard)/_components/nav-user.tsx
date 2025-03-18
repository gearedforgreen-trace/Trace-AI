"use client"

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, Laptop2, LogOut, MoonIcon, Sparkles, SunIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {

  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { isMobile } = useSidebar()

  const handleThemeSelect = (theme: string) => {
    setTheme(theme)
  }

  const signOut = () => {
    router.push('/sign-in')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.name}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold font-nunito">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold font-nunito">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 py-2 font-semibold">
              <span className="">
                {theme === 'light' && <SunIcon className="size-4" />}
                {theme === 'dark' && <MoonIcon className="size-4" />}
                {theme === 'system' && <Laptop2 className="size-4" />}
              </span>
              <span className="flex-1">Color theme</span>
              <span className="text-xs capitalize text-muted-foreground">
                {theme} mode
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onSelect={() => handleThemeSelect('light')}
                className={cn('flex items-center gap-3 ', {
                  'bg-muted': theme === 'light',
                })}
              >
                <SunIcon className="size-4" /> <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleThemeSelect('dark')}
                className={cn('flex items-center gap-3 ', {
                  'bg-muted': theme === 'dark',
                })}
              >
                <MoonIcon className="size-4" /> <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleThemeSelect('system')}
                className={cn('flex items-center gap-3 ', {
                  'bg-muted': theme === 'system',
                })}
              >
                <Laptop2 className="size-4" /> <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => {
              signOut()
            }}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

