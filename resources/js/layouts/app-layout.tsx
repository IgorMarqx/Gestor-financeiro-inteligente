import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type ReactNode } from 'react';
import { GlobalModals } from '@/components/modals/GlobalModals';
import { ChatWidget } from '@/components/chat/chat-widget';
import { usePage } from '@inertiajs/react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const page = usePage();

    return (
        <>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>

            {page.url.includes('/chat') ? null : <ChatWidget />}
            <GlobalModals />
        </>
    );
}
