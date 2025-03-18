'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { cn, isActivePath } from '@/lib/utils';
import { usePathname } from "next/navigation";
export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const {state} = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem className="my-1.5">
              {item.items?.length && item.items.length > 0 ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        'font-bold h-10 text-base cursor-pointer font-nunito',
                        isActivePath(item.url, pathname) && !isCollapsed
                          ? '!bg-gradient-to-r from-primary-dark via-primary to-primary-light !text-primary-foreground'
                          : '',
                      )}
                      tooltip={item.title}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <Link href={subItem.url} passHref>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <Link href={item.url} passHref>
                  <SidebarMenuButton
                    className={cn(
                      'font-bold h-10 text-base cursor-pointer font-nunito',
                      isActivePath(item.url, pathname) && !isCollapsed
                        ? '!bg-gradient-to-r from-primary-dark via-primary to-primary-light !text-primary-foreground'
                        : '',
                        isActivePath(item.url, pathname) && isCollapsed? '!text-primary' : ''
                    )}
                    tooltip={item.title}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
