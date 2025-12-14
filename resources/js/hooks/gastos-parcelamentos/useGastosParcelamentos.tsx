import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { ApiGastoParcelamento } from '@/types/ApiGastoParcelamento';
import { useEffect, useState } from 'react';

type Paginated<T> = {
    itens: T[];
    paginacao: { pagina_atual: number; por_pagina: number; total: number; ultima_pagina: number };
};

export function useGastosParcelamentos(perPage: number = 15) {
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [data, setData] = useState<Paginated<ApiGastoParcelamento> | null>(null);

    const load = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await http.get<ApiResponse<Paginated<ApiGastoParcelamento>>>(
                '/gastos-parcelamentos',
                { params: { page, per_page: perPage } },
            );
            setData(response.data.data);
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao carregar parcelamentos.',
                );
            } else {
                setErrorMessage('Erro ao carregar parcelamentos.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [page, perPage]);

    return { data, isLoading, errorMessage, page, setPage, reload: load };
}

