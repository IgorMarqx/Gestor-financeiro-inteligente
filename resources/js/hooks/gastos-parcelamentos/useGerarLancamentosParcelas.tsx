import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export type GerarLancamentosResult = { gerados: number };

export function useGerarLancamentosParcelas() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const gerarLancamentos = async (): Promise<GerarLancamentosResult | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const response = await http.post<ApiResponse<GerarLancamentosResult>>(
                '/gastos-parcelas/gerar-lancamentos',
            );
            notifications.success(
                'Lançamentos gerados',
                `Gerados: ${response.data.data?.gerados ?? 0}`,
            );
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const message =
                    error.response?.data?.message ?? 'Erro ao gerar lançamentos.';
                setErrorMessage(message);
                notifications.error('Não foi possível gerar lançamentos', message);
            } else {
                setErrorMessage('Erro ao gerar lançamentos.');
                notifications.error(
                    'Não foi possível gerar lançamentos',
                    'Erro ao gerar lançamentos.',
                );
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { gerarLancamentos, isSubmitting, errorMessage };
}
