import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

export type GerarParcelasResult = { criadas: number; ja_existiam: boolean };

export function useGerarParcelas() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const gerarParcelas = async (parcelamentoId: number): Promise<GerarParcelasResult | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const response = await http.post<ApiResponse<GerarParcelasResult>>(
                `/gastos-parcelamentos/${parcelamentoId}/gerar-parcelas`,
            );
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao gerar parcelas.',
                );
            } else {
                setErrorMessage('Erro ao gerar parcelas.');
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { gerarParcelas, isSubmitting, errorMessage };
}

