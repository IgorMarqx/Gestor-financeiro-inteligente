import { http, isApiError } from '@/lib/http';
import { ApiGasto } from '@/types/ApiGasto';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

export type GastoValidacaoPayload = {
    nome: string;
    valor: number;
    data: string;
    categoria_gasto_id: number;
};

export type GastoValidacaoResult = {
    possivel_duplicado: ApiGasto[];
    suspeito: boolean;
    motivo_texto: string | null;
};

export function useGastoValidacao() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const validar = async (payload: GastoValidacaoPayload): Promise<GastoValidacaoResult | null> => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await http.post<ApiResponse<GastoValidacaoResult>>(
                '/gastos/validar',
                payload,
            );
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao validar gasto.',
                );
            } else {
                setErrorMessage('Erro ao validar gasto.');
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { validar, isLoading, errorMessage };
}

