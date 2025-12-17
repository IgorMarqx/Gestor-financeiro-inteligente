import { Sparkles } from 'lucide-react';
import { type ApiChat } from '@/types/ApiChat';

export type ChatUiMessage = {
    id: number | string;
    role: 'system' | 'user' | 'assistant';
    conteudo: string;
    isTyping?: boolean;
};

type Props = {
    activeChat: ApiChat | null;
    activeChatId: number | null;
    messages: ChatUiMessage[];
    draft: string;
    isSending: boolean;
    onDraftChange: (value: string) => void;
    onSend: () => void;
    onSendFromEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

function TypingDots() {
    return (
        <div className="flex items-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.1s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
        </div>
    );
}

export function ChatConversationPanel({
    activeChat,
    activeChatId,
    messages,
    draft,
    isSending,
    onDraftChange,
    onSend,
    onSendFromEnter,
}: Props) {
    return (
        <section className="flex min-w-0 flex-1 flex-col">
            <div className="border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                            {activeChat?.titulo ??
                                (activeChatId ? 'Novo Chat' : 'Selecione um chat')}
                        </div>
                        <div className="text-xs text-muted-foreground">#00A56D • Em breve</div>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full bg-[#00A56D]/10 px-3 py-1 text-xs font-medium text-[#00A56D] dark:bg-[#00A56D]/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        IA
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <div className="mx-auto w-full max-w-2xl space-y-4">
                    {activeChatId == null ? (
                        <div className="rounded-xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                            Crie ou selecione um chat na coluna da esquerda.
                        </div>
                    ) : null}

                    {activeChatId != null && messages.length === 0 ? (
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00A56D]/10 text-sm font-semibold text-[#00A56D] dark:bg-[#00A56D]/20">
                                IA
                            </div>
                            <div className="max-w-[85%] rounded-2xl rounded-tl-md border bg-card px-4 py-3 text-sm">
                                Me diga o que você quer analisar (gastos, receitas, categorias,
                                parcelas) e eu monto um resumo.
                            </div>
                        </div>
                    ) : null}

                    {messages.map((m) => {
                        const isUser = m.role === 'user';
                        return (
                            <div
                                key={m.id}
                                className={['flex items-start gap-3', isUser ? 'justify-end' : ''].join(
                                    ' ',
                                )}
                            >
                                {!isUser ? (
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00A56D]/10 text-sm font-semibold text-[#00A56D] dark:bg-[#00A56D]/20">
                                        IA
                                    </div>
                                ) : null}
                                <div
                                    className={[
                                        'max-w-[85%] px-4 py-3 text-sm',
                                        isUser
                                            ? 'rounded-2xl rounded-tr-md bg-muted'
                                            : 'rounded-2xl rounded-tl-md border bg-card',
                                    ].join(' ')}
                                >
                                    {m.isTyping ? <TypingDots /> : m.conteudo}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-t bg-background/60 p-4">
                <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
                    <input
                        value={draft}
                        onChange={(e) => onDraftChange(e.target.value)}
                        onKeyDown={onSendFromEnter}
                        className="h-11 w-full rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground outline-none ring-[#00A56D]/20 placeholder:text-muted-foreground focus-visible:ring-2 disabled:cursor-not-allowed"
                        placeholder="Digite sua mensagem…"
                        disabled={!activeChatId || isSending}
                    />
                    <button
                        type="button"
                        disabled={!activeChatId || isSending || !draft.trim()}
                        className="inline-flex h-11 items-center justify-center rounded-md bg-[#00A56D] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={onSend}
                    >
                        {isSending ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </div>
        </section>
    );
}
