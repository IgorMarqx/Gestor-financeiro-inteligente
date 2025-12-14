import { http, isApiError } from '@/lib/http';
import { useState } from 'react';

export function useDeleteGasto() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const deleteGasto = async (id: number): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await http.delete(`/gastos/${id}`);
            return true;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(error.response?.data?.message ?? 'Erro ao remover gasto.');
            } else {
                setErrorMessage('Erro ao remover gasto.');
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { deleteGasto, isSubmitting, errorMessage };
}

