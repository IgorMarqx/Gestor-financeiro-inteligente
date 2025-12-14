import { Icon } from '@/components/icon';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, router } from '@inertiajs/react';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const url = resolveUrl(item.href);
                        const method =
                            typeof item.href === 'string'
                                ? 'get'
                                : (item.href.method ?? 'get');
                        const isExternal =
                            typeof item.href === 'string' &&
                            /^https?:\/\//.test(item.href);

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100 cursor-pointer"
                                >
                                    {isExternal ? (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {item.icon && (
                                                <Icon
                                                    iconNode={item.icon}
                                                    className="h-5 w-5"
                                                />
                                            )}
                                            <span>{item.title}</span>
                                        </a>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            method={method}
                                            as={
                                                method === 'get'
                                                    ? undefined
                                                    : 'button'
                                            }
                                            className="flex w-full items-center gap-2 text-left"
                                            onClick={() => {
                                                if (method !== 'get') {
                                                    router.flushAll();
                                                }
                                            }}
                                        >
                                            {item.icon && (
                                                <Icon
                                                    iconNode={item.icon}
                                                    className="h-5 w-5"
                                                />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
