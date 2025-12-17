import { http, isApiError } from '@/lib/http';
import { ApiCategoriaGasto } from '@/types/ApiCategoriaGasto';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

type CreateCategoriaPayload = { nome: string };

export function useCreateCategoriaGasto() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const createCategoria = async (payload: CreateCategoriaPayload): Promise<ApiCategoriaGasto | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await http.post<ApiResponse<ApiCategoriaGasto>>(
                '/categorias-gastos',
                payload,
            );
            notifications.success('Categoria criada', 'Categoria salva com sucesso.');
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message;
                const apiErrors = error.response?.data?.errors;
                const firstFieldError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null;
                const message = firstFieldError ?? apiMessage ?? 'Erro ao criar categoria.';
                setErrorMessage(message);
                notifications.error('Não foi possível criar a categoria', message);
            } else {
                setErrorMessage('Erro ao criar categoria.');
                notifications.error('Não foi possível criar a categoria', 'Erro ao criar categoria.');
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { createCategoria, isSubmitting, errorMessage };
}
