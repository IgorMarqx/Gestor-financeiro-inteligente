import { http, isApiError } from '@/lib/http';
import { ApiGasto } from '@/types/ApiGasto';
import { useState } from 'react';

export type UpdateGastoPayload = {
    nome: string;
    valor: number;
    data: string;
    descricao: string | null;
    categoria_gasto_id: number;
};

export function useUpdateGasto() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const updateGasto = async (
        id: number,
        payload: UpdateGastoPayload,
    ): Promise<ApiGasto | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await http.put<{ data: ApiGasto }>(`/gastos/${id}`, payload);
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message;
                const apiErrors = error.response?.data?.errors;
                const firstFieldError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null;
                setErrorMessage(firstFieldError ?? apiMessage ?? 'Erro ao atualizar gasto.');
            } else {
                setErrorMessage('Erro ao atualizar gasto.');
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { updateGasto, isSubmitting, errorMessage };
}

