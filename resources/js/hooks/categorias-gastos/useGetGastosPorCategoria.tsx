import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { ApiGastoResumoItem } from '@/types/ApiGastoResumoItem';
import { useCallback, useState } from 'react';

type ResumoParams = { mes?: string; inicio?: string; fim?: string; limit?: number };
type Resposta = {
    categoria: { id: number; nome: string };
    periodo: { inicio: string; fim: string; mes: string | null };
    gastos: ApiGastoResumoItem[];
};

export function useGetGastosPorCategoria() {
    const [isLoadingByCategoria, setIsLoadingByCategoria] = useState<Record<number, boolean>>({});
    const [errorByCategoria, setErrorByCategoria] = useState<Record<number, string | null>>({});
    const [gastosByCategoria, setGastosByCategoria] = useState<Record<number, ApiGastoResumoItem[]>>({});

    const loadGastos = useCallback(async (categoriaId: number, params: ResumoParams): Promise<ApiGastoResumoItem[]> => {
        setIsLoadingByCategoria((prev) => ({ ...prev, [categoriaId]: true }));
        setErrorByCategoria((prev) => ({ ...prev, [categoriaId]: null }));

        try {
            const response = await http.get<ApiResponse<Resposta>>(`/categorias-gastos/${categoriaId}/gastos`, {
                params,
            });
            const gastos = response.data.data.gastos ?? [];
            setGastosByCategoria((prev) => ({ ...prev, [categoriaId]: gastos }));
            return gastos;
        } catch (error) {
            const message = isApiError(error)
                ? (error.response?.data?.message ?? 'Erro ao carregar gastos da categoria.')
                : 'Erro ao carregar gastos da categoria.';
            setErrorByCategoria((prev) => ({ ...prev, [categoriaId]: message }));
            return [];
        } finally {
            setIsLoadingByCategoria((prev) => ({ ...prev, [categoriaId]: false }));
        }
    }, []);

    return { loadGastos, isLoadingByCategoria, errorByCategoria, gastosByCategoria };
}

