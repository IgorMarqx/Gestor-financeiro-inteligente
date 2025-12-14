import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

export type GerarLancamentosResult = { gerados: number };

export function useGerarLancamentosParcelas() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const gerarLancamentos = async (): Promise<GerarLancamentosResult | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const response = await http.post<ApiResponse<GerarLancamentosResult>>(
                '/gastos-parcelas/gerar-lancamentos',
            );
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao gerar lançamentos.',
                );
            } else {
                setErrorMessage('Erro ao gerar lançamentos.');
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { gerarLancamentos, isSubmitting, errorMessage };
}

