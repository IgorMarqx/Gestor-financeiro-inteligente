import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { type ApiChat } from '@/types/ApiChat';
import { useEffect, useState } from 'react';

export function useGetChats() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [chats, setChats] = useState<ApiChat[]>([]);

    const reload = async (): Promise<ApiChat[] | null> => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await http.get<ApiResponse<ApiChat[]>>('/chat/getChats');
            const items = response.data.data ?? [];
            setChats(items);
            return items;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(error.response?.data?.message ?? 'Erro ao carregar chats.');
            } else {
                setErrorMessage('Erro ao carregar chats.');
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void reload();
    }, []);

    return { chats, isLoading, errorMessage, reload, setChats };
}

