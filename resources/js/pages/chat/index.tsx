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
import { type ChatUiMessage } from '@/components/chat/chat-conversation-panel';
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
    const [messagesByChatId, setMessagesByChatId] = useState<Record<number, ChatUiMessage[]>>({});

    const activeChat = useMemo(
        () => (activeChatId ? chats.find((c) => c.id === activeChatId) ?? null : null),
        [activeChatId, chats],
    );
    const activeMessages = useMemo(
        () => (activeChatId ? messagesByChatId[activeChatId] ?? [] : []),
        [activeChatId, messagesByChatId],
    );

    const upsertTitleFromPrompt = (chatId: number, currentTitle: string, prompt: string) => {
        if (currentTitle.trim() !== 'Novo Chat') return;
        const nextTitle = deriveChatTitleFromPrompt(prompt);
        setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, titulo: nextTitle } : c)));
    };

    const handleSend = async () => {
        if (!activeChatId) return;
        const prompt = draft.trim();
        if (!prompt) return;

        const currentTitle = activeChat?.titulo ?? 'Novo Chat';

        const tempUserId = `temp_user_${Date.now()}`;
        const tempTypingId = `temp_typing_${Date.now()}`;

        setDraft('');
        setMessagesByChatId((prev) => {
            const current = prev[activeChatId] ?? [];
            return {
                ...prev,
                [activeChatId]: [
                    ...current,
                    { id: tempUserId, role: 'user', conteudo: prompt },
                    { id: tempTypingId, role: 'assistant', conteudo: '', isTyping: true },
                ],
            };
        });

        const msgs = await sendMessage(activeChatId, prompt, currentTitle);
        if (msgs) {
            setMessagesByChatId((prev) => ({
                ...prev,
                [activeChatId]: (msgs as ApiChatMensagem[]).map((m) => ({
                    id: m.id,
                    role: m.role,
                    conteudo: m.conteudo,
                })),
            }));
            upsertTitleFromPrompt(activeChatId, currentTitle, prompt);
            return;
        }

        // erro: remove somente o "digitando", mantém a mensagem do usuário.
        setMessagesByChatId((prev) => {
            const current = prev[activeChatId] ?? [];
            return {
                ...prev,
                [activeChatId]: current.filter((m) => m.id !== tempTypingId),
            };
        });
    };

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

                <div className="flex min-h-[82vh] max-h-[72vh] flex-1 overflow-hidden rounded-xl border border-border/70 bg-background">
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
                            if (msgs) {
                                setMessagesByChatId((prev) => ({
                                    ...prev,
                                    [chatId]: msgs.map((m) => ({
                                        id: m.id,
                                        role: m.role,
                                        conteudo: m.conteudo,
                                    })),
                                }));
                            }
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
                            await handleSend();
                        }}
                        onSend={handleSend}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
