import { Link } from '@inertiajs/react';
import { ExternalLink, Sparkles, X } from 'lucide-react';
import {
    type PointerEvent as ReactPointerEvent,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    CHAT_BUTTON_SIZE,
    CHAT_GAP,
    CHAT_PADDING,
    CHAT_POS_STORAGE_KEY,
    CHAT_SIZE_STORAGE_KEY,
    clampButtonPosition,
    defaultButtonPosition,
    defaultPanelSize,
    getViewport,
    safeParseJson,
    type Point,
    type Size,
} from '@/components/chat/chat-widget-utils';

export function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [buttonPos, setButtonPos] = useState<Point | null>(() => {
        if (typeof window === 'undefined') return null;
        const savedPos = safeParseJson<Point>(localStorage.getItem(CHAT_POS_STORAGE_KEY));
        return clampButtonPosition(savedPos ?? defaultButtonPosition());
    });
    const [panelSize, setPanelSize] = useState<Size>(() => {
        if (typeof window === 'undefined') return defaultPanelSize();
        const savedSize = safeParseJson<Size>(localStorage.getItem(CHAT_SIZE_STORAGE_KEY));
        return savedSize?.width && savedSize?.height ? savedSize : defaultPanelSize();
    });

    const buttonRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);

    const pointer = useRef<{
        pointerId: number;
        offsetX: number;
        offsetY: number;
        startX: number;
        startY: number;
        moved: boolean;
    } | null>(null);

    useEffect(() => {
        if (!buttonPos) return;
        localStorage.setItem(CHAT_POS_STORAGE_KEY, JSON.stringify(buttonPos));
    }, [buttonPos]);

    useEffect(() => {
        if (!panelSize?.width || !panelSize?.height) return;
        localStorage.setItem(CHAT_SIZE_STORAGE_KEY, JSON.stringify(panelSize));
    }, [panelSize]);

    useEffect(() => {
        if (!buttonPos) return;
        const handleResize = () => setButtonPos((prev) => (prev ? clampButtonPosition(prev) : prev));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [buttonPos]);

    useLayoutEffect(() => {
        if (!open) return;
        const el = panelRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const target = entry.target as HTMLElement;
            const next = {
                width: Math.round(target.getBoundingClientRect().width),
                height: Math.round(target.getBoundingClientRect().height),
            };
            setPanelSize((prev) => {
                if (Math.abs(prev.width - next.width) <= 1 && Math.abs(prev.height - next.height) <= 1)
                    return prev;
                return next;
            });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [open]);

    const panelPos = useMemo(() => {
        if (!buttonPos) return { left: CHAT_PADDING, top: CHAT_PADDING };
        const { width: vw, height: vh } = getViewport();

        let left = buttonPos.x;
        let top = buttonPos.y - panelSize.height - CHAT_GAP;

        if (left + panelSize.width > vw - CHAT_PADDING) left = vw - CHAT_PADDING - panelSize.width;
        if (left < CHAT_PADDING) left = CHAT_PADDING;

        if (top < CHAT_PADDING) top = buttonPos.y + CHAT_BUTTON_SIZE + CHAT_GAP;
        if (top + panelSize.height > vh - CHAT_PADDING) top = vh - CHAT_PADDING - panelSize.height;

        return { left, top };
    }, [buttonPos, panelSize.height, panelSize.width]);

    const onPointerDown = (e: ReactPointerEvent) => {
        if (!buttonRef.current || buttonPos == null) return;
        if (e.button !== 0) return;

        const rect = buttonRef.current.getBoundingClientRect();
        pointer.current = {
            pointerId: e.pointerId,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            startX: e.clientX,
            startY: e.clientY,
            moved: false,
        };
        buttonRef.current.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: ReactPointerEvent) => {
        const state = pointer.current;
        if (!state || buttonPos == null) return;
        if (e.pointerId !== state.pointerId) return;

        const dx = Math.abs(e.clientX - state.startX);
        const dy = Math.abs(e.clientY - state.startY);
        if (dx + dy > 5) state.moved = true;

        const next = clampButtonPosition({
            x: e.clientX - state.offsetX,
            y: e.clientY - state.offsetY,
        });
        setButtonPos(next);
    };

    const onPointerUp = (e: ReactPointerEvent) => {
        const state = pointer.current;
        if (!state || e.pointerId !== state.pointerId) return;
        pointer.current = null;

        if (!state.moved) setOpen((prev) => !prev);
    };

    if (!buttonPos) return null;

    return (
        <>
            {open ? (
                <div
                    ref={panelRef}
                    className="fixed z-50 flex min-h-[260px] min-w-[280px] max-w-[min(92vw,720px)] max-h-[min(92vh,820px)] flex-col overflow-hidden rounded-xl border border-border/70 bg-background/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/80"
                    style={{
                        left: panelPos.left,
                        top: panelPos.top,
                        width: panelSize.width,
                        height: panelSize.height,
                        boxSizing: 'border-box',
                        resize: 'both',
                    }}
                >
                    <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#00A56D]/10 text-[#00A56D] dark:bg-[#00A56D]/20">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            <div className="leading-tight">
                                <div className="text-sm font-medium">Assistente</div>
                                <div className="text-xs text-muted-foreground">IA • Em breve</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link
                                href="/chat"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                                title="Abrir página do chat"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                            <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                                onClick={() => setOpen(false)}
                                title="Fechar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-3">
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A56D]/10 text-xs font-semibold text-[#00A56D] dark:bg-[#00A56D]/20">
                                    IA
                                </div>
                                <div className="max-w-[85%] rounded-2xl rounded-tl-md border bg-card px-3 py-2 text-sm">
                                    Oi! Eu vou ajudar você com suas finanças. 🙂
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        (por enquanto é só o layout)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start justify-end gap-2">
                                <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-muted px-3 py-2 text-sm">
                                    Quero ver meus gastos do mês.
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A56D]/10 text-xs font-semibold text-[#00A56D] dark:bg-[#00A56D]/20">
                                    IA
                                </div>
                                <div className="max-w-[85%] rounded-2xl rounded-tl-md border bg-card px-3 py-2 text-sm">
                                    Em breve vou listar seus gastos aqui e sugerir insights.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t bg-background/60 p-3">
                        <div className="flex items-center gap-2">
                            <input
                                disabled
                                className="h-10 w-full rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground outline-none ring-[#00A56D]/20 placeholder:text-muted-foreground focus-visible:ring-2 disabled:cursor-not-allowed"
                                placeholder="Digite sua mensagem…"
                            />
                            <button
                                type="button"
                                disabled
                                className="inline-flex h-10 items-center justify-center rounded-md bg-[#00A56D] px-4 text-sm font-medium text-white opacity-60 disabled:cursor-not-allowed"
                                title="Enviar (em breve)"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <div
                ref={buttonRef}
                className="fixed z-50 select-none touch-none"
                style={{
                    left: buttonPos.x,
                    top: buttonPos.y,
                    width: CHAT_BUTTON_SIZE,
                    height: CHAT_BUTTON_SIZE,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <button
                    type="button"
                    className="flex h-full w-full items-center justify-center rounded-full bg-[#00A56D] text-white shadow-lg shadow-[#00A56D]/20 hover:brightness-110 cursor-pointer"
                    aria-label={open ? 'Fechar chat' : 'Abrir chat'}
                >
                    <Sparkles className="h-6 w-6" />
                </button>
            </div>
        </>
    );
}
