import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useCallback, useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export function useDeleteCategoriaGasto() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const deleteCategoria = useCallback(async (id: number): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await http.delete<ApiResponse<null>>(`/categorias-gastos/${id}`);
            notifications.success('Categoria excluída', 'Categoria removida com sucesso.');
            return true;
        } catch (error) {
            const message = isApiError(error)
                ? (error.response?.data?.message ?? 'Erro ao excluir categoria.')
                : 'Erro ao excluir categoria.';
            setErrorMessage(message);
            notifications.error('Não foi possível excluir a categoria', message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [notifications]);

    return { deleteCategoria, isSubmitting, errorMessage };
}

