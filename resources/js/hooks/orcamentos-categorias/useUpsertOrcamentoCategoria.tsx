import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

type Payload = {
    categoria_gasto_id: number;
    mes: string; // YYYY-MM
    limite: number;
};

export function useUpsertOrcamentoCategoria() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const upsertOrcamento = async (payload: Payload): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await http.post<ApiResponse<unknown>>('/orcamentos-categorias/upsert', payload);
            return true;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao salvar orçamento.',
                );
            } else {
                setErrorMessage('Erro ao salvar orçamento.');
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { upsertOrcamento, isSubmitting, errorMessage };
}

