import { http, isApiError } from '@/lib/http';
import { ApiGasto } from '@/types/ApiGasto';
import { ApiResponse } from '@/types/ApiResponse';
import { type CreateGastoPayload } from '@/types/CreateGasto';
import { useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export function useCreateGastos() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const createGasto = async (payload: CreateGastoPayload): Promise<ApiGasto | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await http.post<ApiResponse<ApiGasto>>('/gastos', payload);
            notifications.success('Gasto criado', 'Seu gasto foi salvo com sucesso.');
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message;
                const apiErrors = error.response?.data?.errors;
                const firstFieldError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null;
                const message = firstFieldError ?? apiMessage ?? 'Erro ao criar gasto.';
                setErrorMessage(message);
                notifications.error('Não foi possível criar o gasto', message);
            } else {
                setErrorMessage('Erro ao criar gasto.');
                notifications.error('Não foi possível criar o gasto', 'Erro ao criar gasto.');
            }

            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { createGasto, isSubmitting, errorMessage };
}
