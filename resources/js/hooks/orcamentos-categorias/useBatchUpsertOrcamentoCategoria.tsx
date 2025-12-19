import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

type Payload = {
    categoria_gasto_id: number;
    meses: string[]; // YYYY-MM
    limite: number;
    categoriaNome: string;
};

export function useBatchUpsertOrcamentoCategoria() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const batchUpsertOrcamento = async (payload: Payload): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await http.post<ApiResponse<{ updated: number }>>(
                '/orcamentos-categorias/batch-upsert',
                payload,
            );
            return true;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao salvar orçamentos.',
                );
            } else {
                setErrorMessage('Erro ao salvar orçamentos.');
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { batchUpsertOrcamento, isSubmitting, errorMessage };
}

