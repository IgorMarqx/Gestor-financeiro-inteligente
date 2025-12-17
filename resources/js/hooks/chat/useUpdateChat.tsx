import { http, isApiError } from '@/lib/http';
import { useState } from 'react';
import { ApiResponse } from '@/types/ApiResponse';
import { type ApiChat } from '@/types/ApiChat';
import { useNotifications } from '@/components/notifications/notifications';

export function useUpdateChat() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const updateChatTitle = async (chatId: number, titulo: string): Promise<ApiChat | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const response = await http.put<ApiResponse<ApiChat>>('/chat/updateChat', {
                chat_id: chatId,
                titulo,
            });
            return response.data.data;
        } catch (error) {
            const message = isApiError(error)
                ? error.response?.data?.message ?? 'Erro ao atualizar chat.'
                : 'Erro ao atualizar chat.';
            setErrorMessage(message);
            notifications.error('Não foi possível atualizar o chat', message);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { updateChatTitle, isSubmitting, errorMessage };
}

