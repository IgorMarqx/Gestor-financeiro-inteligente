import { http, isApiError } from '@/lib/http';
import { ApiGasto } from '@/types/ApiGasto';
import { ApiResponse } from '@/types/ApiResponse';
import { useNotifications } from '@/components/notifications/notifications';
import { useState } from 'react';

export type UpdateGastoPayload = {
    nome: string;
    valor: number;
    data: string;
    descricao: string | null;
    categoria_gasto_id: number;
    metodo_pagamento?: 'DEBITO' | 'CREDITO' | 'PIX' | 'DINHEIRO' | null;
    tipo?: 'FIXO' | 'VARIAVEL' | null;
    necessidade?: 'ESSENCIAL' | 'SUPERFLUO' | null;
};

export function useUpdateGasto() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const updateGasto = async (
        id: number,
        payload: UpdateGastoPayload,
    ): Promise<ApiGasto | null> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await http.put<ApiResponse<ApiGasto>>(`/gastos/${id}`, payload);
            notifications.success('Gasto atualizado', 'As alterações foram salvas.');
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message;
                const apiErrors = error.response?.data?.errors;
                const firstFieldError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null;
                const message = firstFieldError ?? apiMessage ?? 'Erro ao atualizar gasto.';
                setErrorMessage(message);
                notifications.error('Não foi possível atualizar o gasto', message);
            } else {
                setErrorMessage('Erro ao atualizar gasto.');
                notifications.error('Não foi possível atualizar o gasto', 'Erro ao atualizar gasto.');
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { updateGasto, isSubmitting, errorMessage };
}
