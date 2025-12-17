import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export type GerarParcelasResult = { criadas: number; ja_existiam: boolean };

export function useGerarParcelas() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const gerarParcelas = async (parcelamentoId: number): Promise<GerarParcelasResult | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const response = await http.post<ApiResponse<GerarParcelasResult>>(
                `/gastos-parcelamentos/${parcelamentoId}/gerar-parcelas`,
            );
            notifications.success(
                'Parcelas geradas',
                response.data.data?.ja_existiam
                    ? 'As parcelas já existiam.'
                    : `Criadas: ${response.data.data?.criadas ?? 0}`,
            );
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const message = error.response?.data?.message ?? 'Erro ao gerar parcelas.';
                setErrorMessage(message);
                notifications.error('Não foi possível gerar parcelas', message);
            } else {
                setErrorMessage('Erro ao gerar parcelas.');
                notifications.error('Não foi possível gerar parcelas', 'Erro ao gerar parcelas.');
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { gerarParcelas, isSubmitting, errorMessage };
}
