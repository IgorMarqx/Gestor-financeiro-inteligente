import { useNotifications } from '@/components/notifications/notifications';
import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

export function useDestroyFamilias() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const handleDeleteFamilia = async (): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await http.delete<ApiResponse<null>>('/familia');
            notifications.success('Familia removida', 'A familia foi removida com sucesso.');
            return true;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message ?? 'Nao foi possivel remover a familia.';
                setErrorMessage(apiMessage);
                notifications.error('Nao foi possivel remover a familia', apiMessage);
            } else {
                setErrorMessage('Nao foi possivel remover a familia.');
                notifications.error('Nao foi possivel remover a familia', 'Ocorreu um erro ao remover a familia.');
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, errorMessage, handleDeleteFamilia };
}
