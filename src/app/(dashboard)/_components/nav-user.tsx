'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  Laptop2,
  LogOut,
  MoonIcon,
  Sparkles,
  SunIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { memo, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const UserAvatar = memo(
  ({ name, image }: { name: string; image: string }) => {
    return (
      <Avatar className="h-8 w-8 rounded-full">
        <AvatarImage src={image ?? ''} alt={name ?? ''} />
        <AvatarFallback className="rounded-lg">{name}</AvatarFallback>
      </Avatar>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.name === nextProps.name && prevProps.image === nextProps.image
    );
  }
);

UserAvatar.displayName = 'UserAvatar';
export const UserNavSkeleton = memo(() => {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-2 w-24" />
      </div>
    </div>
  );
});

UserNavSkeleton.displayName = 'UserNavSkeleton';

export function NavUser() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isMobile } = useSidebar();

  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      authClient.signOut();
      window.location.href = '/sign-in';
    }
  }, [error]);

  const handleThemeSelect = (theme: string) => {
    setTheme(theme);
  };

  const user = session?.user;

  const handleSignOut = async () => {
    toast.promise(authClient.signOut(), {
      loading: 'Signing out...',
      success: () => {
        router.push('/sign-in');
        return 'Signed out successfully';
      },
      error: (error) => {
        console.log(error);
        return 'Failed to sign out, please try again';
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              {isPending ? (
                <UserNavSkeleton />
              ) : (
                <>
                  <UserAvatar
                    name={user?.name ?? ''}
                    image={user?.image ?? ''}
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold font-nunito">
                      {user?.name}
                    </span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              {isPending ? (
                <UserNavSkeleton />
              ) : (
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar
                    name={user?.name ?? ''}
                    image={user?.image ?? ''}
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold font-nunito">
                      {user?.name}
                    </span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                </div>
              )}
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
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
