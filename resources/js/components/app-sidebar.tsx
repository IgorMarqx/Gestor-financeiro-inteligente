import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, logout } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, LogOut, MessageCircle, Receipt, Tags, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const controleNavItems: NavItem[] = [
    {
        title: 'Gastos',
        href: '/gastos',
        icon: Receipt,
    },
    {
        title: 'Categorias',
        href: '/categorias',
        icon: Tags,
    },
    {
        title: 'Familia',
        href: '/familia',
        icon: Users,
    },
    {
        title: 'Chat IA',
        href: '/chat',
        icon: MessageCircle,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Sair',
        href: logout(),
        icon: LogOut,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} title='Principal' />
                <NavMain items={controleNavItems} title='Controle' />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
