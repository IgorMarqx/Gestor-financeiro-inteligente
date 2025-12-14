import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { ApiGastoParcelamento } from '@/types/ApiGastoParcelamento';
import { useState } from 'react';

export function useToggleGastoParcelamento() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const setAtivo = async (
        id: number,
        ativo: boolean,
    ): Promise<ApiGastoParcelamento | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const response = await http.post<ApiResponse<ApiGastoParcelamento>>(
                `/gastos-parcelamentos/${id}/${ativo ? 'ativar' : 'pausar'}`,
            );
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao atualizar parcelamento.',
                );
            } else {
                setErrorMessage('Erro ao atualizar parcelamento.');
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { setAtivo, isSubmitting, errorMessage };
}

