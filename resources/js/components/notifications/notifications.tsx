import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

export type NotificationInput = {
    type: NotificationType;
    title: string;
    description?: string;
    durationMs?: number;
};

type Notification = NotificationInput & {
    id: string;
    createdAt: number;
};

type NotificationsContextValue = {
    notify: (input: NotificationInput) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function generateId() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function iconFor(type: NotificationType) {
    if (type === 'success') return <CheckCircle2 className="h-5 w-5 text-[#00A56D]" />;
    if (type === 'error') return <AlertCircle className="h-5 w-5 text-destructive" />;
    return <Info className="h-5 w-5 text-muted-foreground" />;
}

function ringFor(type: NotificationType) {
    if (type === 'success') return 'ring-[#00A56D]/20';
    if (type === 'error') return 'ring-destructive/20';
    return 'ring-muted/20';
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Notification[]>([]);

    const dismiss = useCallback((id: string) => {
        setItems((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const notify = useCallback(
        (input: NotificationInput) => {
            const notification: Notification = {
                id: generateId(),
                createdAt: Date.now(),
                durationMs: input.durationMs ?? (input.type === 'error' ? 6000 : 3500),
                ...input,
            };

            setItems((prev) => [notification, ...prev].slice(0, 4));

            window.setTimeout(() => dismiss(notification.id), notification.durationMs);
        },
        [dismiss],
    );

    const value = useMemo<NotificationsContextValue>(
        () => ({
            notify,
            success: (title, description) => notify({ type: 'success', title, description }),
            error: (title, description) => notify({ type: 'error', title, description }),
            info: (title, description) => notify({ type: 'info', title, description }),
        }),
        [notify],
    );

    return (
        <NotificationsContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
                {items.map((n) => (
                    <div
                        key={n.id}
                        className={[
                            'pointer-events-auto flex gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80',
                            'ring-1',
                            ringFor(n.type),
                        ].join(' ')}
                        role="status"
                        aria-live="polite"
                    >
                        <div className="mt-0.5">{iconFor(n.type)}</div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{n.title}</div>
                            {n.description ? (
                                <div className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                    {n.description}
                                </div>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                            onClick={() => dismiss(n.id)}
                            aria-label="Fechar notificação"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
    return ctx;
}

