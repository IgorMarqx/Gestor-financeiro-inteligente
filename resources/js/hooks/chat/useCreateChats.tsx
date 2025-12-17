import { useState } from 'react';
import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { type ApiChat } from '@/types/ApiChat';
import { useNotifications } from '@/components/notifications/notifications';

export function useCreateChat() {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const createChat = async (): Promise<ApiChat | null> => {
        setIsLoading(true);
        setSuccess(false);
        setErrorMessage(null);

        try {
            const response = await http.post<ApiResponse<ApiChat>>('/chat/createChat', {
                titulo: 'Novo Chat',
            });
            setSuccess(true);
            notifications.success('Chat criado', 'Novo chat iniciado.');
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message;
                const apiErrors = error.response?.data?.errors;
                const firstFieldError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null;
                const message = firstFieldError ?? apiMessage ?? 'Erro ao criar chat.';
                setErrorMessage(message);
                notifications.error('Não foi possível criar o chat', message);
            } else {
                const message = 'Erro ao criar chat.';
                setErrorMessage(message);
                notifications.error('Não foi possível criar o chat', message);
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, success, errorMessage, createChat };
}

