import { http, isApiError } from '@/lib/http';
import { ApiGasto } from '@/types/ApiGasto';
import { ApiResponse } from '@/types/ApiResponse';
import { useEffect, useMemo, useRef, useState } from 'react';

export type GastosOrderBy = 'data' | 'valor' | 'categoria';
export type OrderDir = 'asc' | 'desc';

export type GastosFilters = {
    inicio: string;
    fim: string;
    categoria_gasto_id?: number | null;
    valor_min?: number | null;
    valor_max?: number | null;
    q?: string;
    somente_recorrentes?: boolean;
    somente_parcelados?: boolean;
    order_by?: GastosOrderBy;
    order_dir?: OrderDir;
    page?: number;
    per_page?: number;
};

export type TotaisPorCategoria = {
    categoria_gasto_id: number;
    categoria_nome: string;
    total: string;
};

export type GastosIndexData = {
    gastos: ApiGasto[];
    paginacao: { pagina_atual: number; por_pagina: number; total: number; ultima_pagina: number };
    total_periodo: string;
    totais_por_categoria: TotaisPorCategoria[];
    periodo: { inicio: string; fim: string };
};

const defaultPerPage = 15;

type UseGastosOptions = {
    enabled?: boolean;
};

export function useGastos(initialFilters: GastosFilters, options: UseGastosOptions = {}) {
    const enabled = options.enabled ?? true;
    const [filters, setFilters] = useState<GastosFilters>({
        ...initialFilters,
        per_page: initialFilters.per_page ?? defaultPerPage,
        order_by: initialFilters.order_by ?? 'data',
        order_dir: initialFilters.order_dir ?? 'desc',
    });

    const [data, setData] = useState<GastosIndexData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const debouncedQ = useDebouncedValue(filters.q ?? '', 350);
    const effectiveFilters = useMemo(() => ({ ...filters, q: debouncedQ }), [filters, debouncedQ]);

    const requestParams = useMemo(() => {
        const params: Record<string, unknown> = {
            ...effectiveFilters,
        };

        if (!effectiveFilters.somente_recorrentes) delete params.somente_recorrentes;
        if (!effectiveFilters.somente_parcelados) delete params.somente_parcelados;

        if (effectiveFilters.somente_recorrentes) params.somente_recorrentes = 1;
        if (effectiveFilters.somente_parcelados) params.somente_parcelados = 1;

        return params;
    }, [effectiveFilters]);

    const load = async (): Promise<void> => {
        if (!enabled) return;
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await http.get<ApiResponse<GastosIndexData>>('/gastos', {
                params: requestParams,
            });
            setData(response.data.data);
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

    useEffect(() => {
        if (!enabled) return;
        void load();
    }, [enabled, effectiveFilters.inicio, effectiveFilters.fim, effectiveFilters.categoria_gasto_id, effectiveFilters.valor_min, effectiveFilters.valor_max, effectiveFilters.q, effectiveFilters.somente_recorrentes, effectiveFilters.somente_parcelados, effectiveFilters.order_by, effectiveFilters.order_dir, effectiveFilters.page, effectiveFilters.per_page]);

    return { filters, setFilters, data, isLoading, errorMessage, reload: load };
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState<T>(value);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setDebounced(value), delayMs);
        return () => {
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        };
    }, [value, delayMs]);

    return debounced;
}
