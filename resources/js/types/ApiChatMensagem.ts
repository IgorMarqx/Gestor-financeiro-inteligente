export type ApiChatMensagem = {
    id: number;
    chat_id: number;
    role: 'system' | 'user' | 'assistant';
    conteudo: string;
    meta: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
};

