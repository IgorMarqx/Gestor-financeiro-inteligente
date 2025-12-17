import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { type ApiChatMensagem } from '@/types/ApiChatMensagem';
import { useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export function useGetConversation() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const getConversation = async (chatId: number): Promise<ApiChatMensagem[] | null> => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await http.get<ApiResponse<ApiChatMensagem[]>>('/chat/getConversation', {
                params: { chat_id: chatId },
            });
            return response.data.data ?? [];
        } catch (error) {
            const message = isApiError(error)
                ? error.response?.data?.message ?? 'Erro ao carregar conversa.'
                : 'Erro ao carregar conversa.';
            setErrorMessage(message);
            notifications.error('Não foi possível carregar a conversa', message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getConversation, isLoading, errorMessage };
}

