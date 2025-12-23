import { useNotifications } from '@/components/notifications/notifications';
import { http, isApiError } from '@/lib/http';
import { ApiFamilia } from '@/types/ApiFamilia';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

export function useCreateFamilias() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const notifications = useNotifications();

    const handleCreateFamilia = async (nome: string): Promise<ApiFamilia | null> => {
        const trimmedNome = nome.trim();
        if (!trimmedNome) return null;
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccess(false);

        try {
            const response = await http.post<ApiResponse<ApiFamilia>>('/familia', { nome: trimmedNome });
            notifications.success('Familia criada', 'Sua familia foi criada com sucesso.');
            setSuccess(true);
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message ?? 'Nao foi possivel criar a familia.';
                setErrorMessage(apiMessage);
                notifications.error('Nao foi possivel criar a familia', apiMessage);
            } else {
                setErrorMessage('Nao foi possivel criar a familia.');
                notifications.error('Nao foi possivel criar a familia', 'Ocorreu um erro ao criar a familia.');
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, errorMessage, success, handleCreateFamilia };
}
