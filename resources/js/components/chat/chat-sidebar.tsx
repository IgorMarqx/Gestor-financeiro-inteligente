import { Plus, Search, Sparkles } from 'lucide-react';
import { type ApiChat } from '@/types/ApiChat';
import { useMemo, useState } from 'react';

type Props = {
    chats: ApiChat[];
    activeChatId: number | null;
    isLoading: boolean;
    isCreating: boolean;
    onCreate: () => void;
    onSelect: (chatId: number) => void;
    onReload: () => void;
};

export function ChatSidebar({
    chats,
    activeChatId,
    isLoading,
    isCreating,
    onCreate,
    onSelect,
    onReload,
}: Props) {
    const [query, setQuery] = useState('');

    const filteredChats = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return chats;
        return chats.filter((c) => (c.titulo ?? 'Novo Chat').toLowerCase().includes(q));
    }, [chats, query]);

    return (
        <aside className="hidden w-[300px] shrink-0 flex-col border-r bg-muted/20 md:flex">
            <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-3 py-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#00A56D]/10 text-[#00A56D] dark:bg-[#00A56D]/20">
                        <Sparkles className="h-5 w-5" />
                    </span>
                    <div className="leading-tight">
                        <div className="text-sm font-semibold">Assistente</div>
                        <div className="text-xs text-muted-foreground">Chats</div>
                    </div>
                </div>

                <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-[#00A56D] px-3 text-sm font-medium text-white shadow-sm hover:brightness-110 disabled:opacity-60 cursor-pointer"
                    disabled={isCreating}
                    onClick={onCreate}
                    title="Novo chat"
                >
                    <Plus className="h-4 w-4" />
                    Novo
                </button>
            </div>

            <div className="p-3">
                <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Buscar em chats"
                    />
                    {query ? (
                        <button
                            type="button"
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setQuery('')}
                        >
                            Limpar
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="flex-1 overflow-auto px-2 pb-3">
                <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">Seus chats</div>
                <div className="space-y-1">
                    {isLoading ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Carregando...</div>
                    ) : null}

                    {!isLoading && chats.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum chat ainda.</div>
                    ) : null}

                    {!isLoading && chats.length > 0 && filteredChats.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            Nenhum chat encontrado.
                        </div>
                    ) : null}

                    {filteredChats.map((chat) => {
                        const active = chat.id === activeChatId;
                        return (
                            <button
                                key={chat.id}
                                type="button"
                                onClick={() => onSelect(chat.id)}
                                className={[
                                    'w-full rounded-md px-3 py-2 text-left text-sm',
                                    active
                                        ? 'bg-[#00A56D]/10 text-foreground'
                                        : 'hover:bg-muted/50',
                                ].join(' ')}
                            >
                                <div className="truncate">{chat.titulo ?? 'Novo Chat'}</div>
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={onReload}
                        className="w-full rounded-md px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted/50"
                    >
                        Atualizar lista
                    </button>
                </div>
            </div>
        </aside>
    );
}
