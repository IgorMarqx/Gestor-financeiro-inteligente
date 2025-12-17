import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { ApiGastoParcelamento } from '@/types/ApiGastoParcelamento';
import { useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export type CreateGastoParcelamentoPayload = {
    categoria_gasto_id: number;
    nome: string;
    descricao: string | null;
    valor_total: number;
    parcelas_total: number;
    data_inicio: string;
    metodo_pagamento?: 'DEBITO' | 'CREDITO' | 'PIX' | 'DINHEIRO' | null;
    tipo?: 'FIXO' | 'VARIAVEL' | null;
    necessidade?: 'ESSENCIAL' | 'SUPERFLUO' | null;
};

export function useCreateGastoParcelamento() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const create = async (
        payload: CreateGastoParcelamentoPayload,
    ): Promise<ApiGastoParcelamento | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const response = await http.post<ApiResponse<ApiGastoParcelamento>>(
                '/gastos-parcelamentos',
                payload,
            );
            notifications.success('Parcelamento criado', 'Parcelamento salvo com sucesso.');
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message;
                const apiErrors = error.response?.data?.errors;
                const firstFieldError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null;
                const message = firstFieldError ?? apiMessage ?? 'Erro ao criar parcelamento.';
                setErrorMessage(message);
                notifications.error('Não foi possível criar o parcelamento', message);
            } else {
                setErrorMessage('Erro ao criar parcelamento.');
                notifications.error(
                    'Não foi possível criar o parcelamento',
                    'Erro ao criar parcelamento.',
                );
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { create, isSubmitting, errorMessage };
}
