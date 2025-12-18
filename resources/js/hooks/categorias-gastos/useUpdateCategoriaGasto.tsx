import { http, isApiError } from '@/lib/http';
import { ApiCategoriaGasto } from '@/types/ApiCategoriaGasto';
import { ApiResponse } from '@/types/ApiResponse';
import { useCallback, useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export function useUpdateCategoriaGasto() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const updateCategoria = useCallback(async (id: number, payload: { nome: string }): Promise<ApiCategoriaGasto | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await http.put<ApiResponse<ApiCategoriaGasto>>(`/categorias-gastos/${id}`, payload);
            notifications.success('Categoria atualizada', 'Categoria salva com sucesso.');
            return response.data.data;
        } catch (error) {
            const message = isApiError(error)
                ? (error.response?.data?.message ?? 'Erro ao atualizar categoria.')
                : 'Erro ao atualizar categoria.';
            setErrorMessage(message);
            notifications.error('Não foi possível atualizar a categoria', message);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    }, [notifications]);

    return { updateCategoria, isSubmitting, errorMessage };
}

