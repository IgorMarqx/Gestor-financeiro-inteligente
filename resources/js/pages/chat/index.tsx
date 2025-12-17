import AppLayout from '@/layouts/app-layout';
import { useConversation } from '@/hooks/chat/useConversation';
import { deriveChatTitleFromPrompt } from '@/hooks/chat/chat-title';
import { useCreateChat } from '@/hooks/chat/useCreateChats';
import { useGetConversation } from '@/hooks/chat/useGetConversation';
import { useGetChats } from '@/hooks/chat/useGetChats';
import { type BreadcrumbItem } from '@/types';
import { type ApiChatMensagem } from '@/types/ApiChatMensagem';
import { Head } from '@inertiajs/react';
import { ChatConversationPanel } from '@/components/chat/chat-conversation-panel';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Chat',
        href: '/chat',
    },
];

export default function ChatPage() {
    const { chats, isLoading: isChatsLoading, reload, setChats } = useGetChats();
    const { createChat, isLoading: isCreating } = useCreateChat();
    const { sendMessage, isSubmitting: isSending } = useConversation();
    const { getConversation, isLoading: isConversationLoading } = useGetConversation();

    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [draft, setDraft] = useState('');
    const [messagesByChatId, setMessagesByChatId] = useState<Record<number, ApiChatMensagem[]>>({});

    const activeChat = useMemo(
        () => (activeChatId ? chats.find((c) => c.id === activeChatId) ?? null : null),
        [activeChatId, chats],
    );
    const activeMessages = useMemo(
        () => (activeChatId ? messagesByChatId[activeChatId] ?? [] : []),
        [activeChatId, messagesByChatId],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#00A56D]/10 text-[#00A56D] dark:bg-[#00A56D]/20">
                        <MessageCircle className="h-5 w-5" />
                    </span>
                    <div className="leading-tight">
                        <h1 className="text-lg font-semibold">Chat com IA</h1>
                        <div className="text-sm text-muted-foreground">
                            Histórico e conversas vão aparecer aqui.
                        </div>
                    </div>
                </div>

                <div className="flex min-h-[72vh] flex-1 overflow-hidden rounded-xl border border-border/70 bg-background">
                    <ChatSidebar
                        chats={chats}
                        activeChatId={activeChatId}
                        isLoading={isChatsLoading || isConversationLoading}
                        isCreating={isCreating}
                        onCreate={async () => {
                            const created = await createChat();
                            if (!created) return;
                            setChats((prev) => [created, ...prev]);
                            setActiveChatId(created.id);
                            setDraft('');
                        }}
                        onSelect={async (chatId) => {
                            setActiveChatId(chatId);
                            const msgs = await getConversation(chatId);
                            if (msgs) setMessagesByChatId((prev) => ({ ...prev, [chatId]: msgs }));
                        }}
                        onReload={() => void reload()}
                    />

                    <ChatConversationPanel
                        activeChat={activeChat}
                        activeChatId={activeChatId}
                        messages={activeMessages}
                        draft={draft}
                        isSending={isSending}
                        onDraftChange={setDraft}
                        onSendFromEnter={async (e) => {
                            if (e.key !== 'Enter') return;
                            if (e.shiftKey) return;
                            e.preventDefault();
                            if (!activeChatId) return;
                            const prompt = draft.trim();
                            if (!prompt) return;
                            setDraft('');
                            const currentTitle = activeChat?.titulo ?? 'Novo Chat';
                            const msgs = await sendMessage(activeChatId, prompt, currentTitle);
                            if (msgs) {
                                setMessagesByChatId((prev) => ({ ...prev, [activeChatId]: msgs }));
                            }
                            if (currentTitle.trim() === 'Novo Chat') {
                                const nextTitle = deriveChatTitleFromPrompt(prompt);
                                setChats((prev) =>
                                    prev.map((c) =>
                                        c.id === activeChatId ? { ...c, titulo: nextTitle } : c,
                                    ),
                                );
                            }
                        }}
                        onSend={async () => {
                            if (!activeChatId) return;
                            const prompt = draft.trim();
                            if (!prompt) return;
                            setDraft('');
                            const currentTitle = activeChat?.titulo ?? 'Novo Chat';
                            const msgs = await sendMessage(activeChatId, prompt, currentTitle);
                            if (msgs) {
                                setMessagesByChatId((prev) => ({ ...prev, [activeChatId]: msgs }));
                            }
                            if (currentTitle.trim() === 'Novo Chat') {
                                const nextTitle = deriveChatTitleFromPrompt(prompt);
                                setChats((prev) =>
                                    prev.map((c) =>
                                        c.id === activeChatId ? { ...c, titulo: nextTitle } : c,
                                    ),
                                );
                            }
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
