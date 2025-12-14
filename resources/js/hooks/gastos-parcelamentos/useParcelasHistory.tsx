import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { ApiGastoParcela } from '@/types/ApiGastoParcela';
import { useEffect, useMemo, useState } from 'react';

type Paginated<T> = {
    itens: T[];
    paginacao: { pagina_atual: number; por_pagina: number; total: number; ultima_pagina: number };
};

export type ParcelasFilters = {
    inicio: string;
    fim: string;
    status?: 'PENDENTE' | 'GERADO' | 'PAGO' | '';
    parcelamento_id?: number | null;
    page?: number;
    per_page?: number;
};

export function useParcelasHistory(initial: ParcelasFilters) {
    const [filters, setFilters] = useState<ParcelasFilters>({
        ...initial,
        page: initial.page ?? 1,
        per_page: initial.per_page ?? 15,
    });
    const [data, setData] = useState<Paginated<ApiGastoParcela> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const params = useMemo(() => {
        const p: Record<string, unknown> = { ...filters };
        if (!filters.status) delete p.status;
        if (!filters.parcelamento_id) delete p.parcelamento_id;
        return p;
    }, [filters]);

    const load = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await http.get<ApiResponse<Paginated<ApiGastoParcela>>>(
                '/gastos-parcelas',
                { params },
            );
            setData(response.data.data);
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? 'Erro ao carregar parcelas.',
                );
            } else {
                setErrorMessage('Erro ao carregar parcelas.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    useEffect(() => {
        setFilters((f) => ({
            ...f,
            inicio: initial.inicio,
            fim: initial.fim,
            status: initial.status,
            page: 1,
        }));
    }, [initial.inicio, initial.fim, initial.status]);

    return { filters, setFilters, data, isLoading, errorMessage, reload: load };
}
