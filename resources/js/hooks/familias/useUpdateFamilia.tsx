import { useNotifications } from '@/components/notifications/notifications';
import { http, isApiError } from '@/lib/http';
import { ApiFamilia } from '@/types/ApiFamilia';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

export function useUpdateFamilia() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const handleUpdateFamilia = async (nome: string): Promise<ApiFamilia | null> => {
        const trimmedNome = nome.trim();
        if (!trimmedNome) return null;
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await http.put<ApiResponse<ApiFamilia>>('/familia', { nome: trimmedNome });
            notifications.success('Familia atualizada', 'Os dados da familia foram atualizados.');
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message ?? 'Nao foi possivel atualizar a familia.';
                setErrorMessage(apiMessage);
                notifications.error('Nao foi possivel atualizar a familia', apiMessage);
            } else {
                setErrorMessage('Nao foi possivel atualizar a familia.');
                notifications.error('Nao foi possivel atualizar a familia', 'Ocorreu um erro ao atualizar a familia.');
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, errorMessage, handleUpdateFamilia };
}
