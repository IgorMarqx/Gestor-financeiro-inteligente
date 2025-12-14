import { http, isApiError } from '@/lib/http';
import { ApiGasto } from '@/types/ApiGasto';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

export function useGetGastos() {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [gastos, setGastos] = useState<ApiGasto[]>([]);

    const loadGastos = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await http.get<ApiResponse<{ gastos: ApiGasto[] }>>('/gastos');
            setGastos(response.data.data.gastos ?? []);
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(error.response?.data?.message ?? 'Erro ao carregar gastos.');
            } else {
                setErrorMessage('Erro ao carregar gastos.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { loadGastos, isLoading, errorMessage, gastos };
}
