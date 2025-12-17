import { http, isApiError } from '@/lib/http';
import { useState } from 'react';
import { ApiResponse } from '@/types/ApiResponse';
import { type ApiChatMensagem } from '@/types/ApiChatMensagem';
import { useNotifications } from '@/components/notifications/notifications';
import { deriveChatTitleFromPrompt } from '@/hooks/chat/chat-title';
import { useUpdateChat } from '@/hooks/chat/useUpdateChat';

export function useConversation() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();
    const { updateChatTitle } = useUpdateChat();

    const sendMessage = async (
        chatId: number,
        prompt: string,
        currentChatTitle: string | null,
    ): Promise<ApiChatMensagem[] | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await http.post<ApiResponse<ApiChatMensagem[]>>('/chat/conversation', {
                chat_id: chatId,
                prompt,
            });

            if ((currentChatTitle ?? 'Novo Chat').trim() === 'Novo Chat') {
                const titulo = deriveChatTitleFromPrompt(prompt);
                void updateChatTitle(chatId, titulo);
            }

            return response.data.data ?? [];
        } catch (error) {
            const message = isApiError(error)
                ? error.response?.data?.message ?? 'Erro ao enviar mensagem.'
                : 'Erro ao enviar mensagem.';
            setErrorMessage(message);
            notifications.error('Não foi possível enviar a mensagem', message);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { sendMessage, isSubmitting, errorMessage };
}

