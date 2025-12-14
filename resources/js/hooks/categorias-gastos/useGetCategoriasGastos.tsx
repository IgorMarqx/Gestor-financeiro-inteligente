import { http, isApiError } from '@/lib/http';
import { ApiCategoriaGasto } from '@/types/ApiCategoriaGasto';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

export function useGetCategoriasGastos() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [categorias, setCategorias] = useState<ApiCategoriaGasto[]>([]);

    const loadCategorias = async (query: string = ''): Promise<ApiCategoriaGasto[]> => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await http.get<ApiResponse<ApiCategoriaGasto[]>>('/categorias-gastos', {
                params: query ? { q: query } : undefined,
            });
            setCategorias(response.data.data);
            return response.data.data;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao carregar categorias.',
                );
            } else {
                setErrorMessage('Erro ao carregar categorias.');
            }
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return { loadCategorias, isLoading, errorMessage, categorias };
}
