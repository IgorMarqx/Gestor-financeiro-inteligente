import { http, isApiError } from '@/lib/http';
import { useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export function useDeleteGasto() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const deleteGasto = async (id: number): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await http.delete(`/gastos/${id}`);
            notifications.success('Gasto removido', 'O gasto foi removido com sucesso.');
            return true;
        } catch (error) {
            if (isApiError(error)) {
                const message = error.response?.data?.message ?? 'Erro ao remover gasto.';
                setErrorMessage(message);
                notifications.error('Não foi possível remover o gasto', message);
            } else {
                setErrorMessage('Erro ao remover gasto.');
                notifications.error('Não foi possível remover o gasto', 'Erro ao remover gasto.');
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { deleteGasto, isSubmitting, errorMessage };
}
