import { http, isApiError } from '@/lib/http';
import { useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export function useDeleteChat() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const deleteChat = async (chatId: number): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            await http.delete('/chat/deleteChat', { params: { chat_id: chatId } });
            notifications.success('Chat removido', 'Conversa removida.');
            return true;
        } catch (error) {
            const message = isApiError(error)
                ? error.response?.data?.message ?? 'Erro ao remover chat.'
                : 'Erro ao remover chat.';
            setErrorMessage(message);
            notifications.error('Não foi possível remover o chat', message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { deleteChat, isSubmitting, errorMessage };
}

