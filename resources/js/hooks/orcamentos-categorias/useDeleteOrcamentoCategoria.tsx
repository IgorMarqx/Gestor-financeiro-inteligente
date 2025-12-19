import { http, isApiError } from '@/lib/http';
import { useState } from 'react';

type Payload = {
    categoria_gasto_id: number;
    mes: string; // YYYY-MM
};

export function useDeleteOrcamentoCategoria() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const deleteOrcamento = async (payload: Payload): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await http.delete('/orcamentos-categorias', { data: payload });
            return true;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao remover orçamento.',
                );
            } else {
                setErrorMessage('Erro ao remover orçamento.');
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { deleteOrcamento, isSubmitting, errorMessage };
}

