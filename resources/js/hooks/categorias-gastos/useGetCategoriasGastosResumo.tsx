import { useCallback, useState } from 'react';
import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { ApiCategoriasGastosResumoResponse } from '@/types/ApiCategoriaGastoResumo';

type ResumoParams = { mes?: string; inicio?: string; fim?: string };

export function useGetCategoriasGastosResumo() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resumo, setResumo] = useState<ApiCategoriasGastosResumoResponse | null>(null);

    const loadResumo = useCallback(async (params: ResumoParams = {}): Promise<ApiCategoriasGastosResumoResponse | null> => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await http.get<ApiResponse<ApiCategoriasGastosResumoResponse>>(
                '/categorias-gastos/resumo',
                { params },
            );
            setResumo(response.data.data);
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(error.response?.data?.message ?? 'Erro ao carregar resumo.');
            } else {
                setErrorMessage('Erro ao carregar resumo.');
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { loadResumo, isLoading, errorMessage, resumo };
}
