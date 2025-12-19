import { useCallback } from 'react';
import { useOrcamentoBatchListener } from '@/hooks/orcamentos-categorias/useOrcamentoBatchListener';

type LoadResumo = (params: { mes?: string; inicio?: string; fim?: string }) => Promise<unknown>;
type LoadCategorias = (query?: string) => Promise<unknown>;

type UseCategoriasGastosRealtimeParams = {
    userId?: number | string;
    mes: string;
    loadResumo: LoadResumo;
    loadCategorias: LoadCategorias;
};

export function useCategoriasGastosRealtime({
    userId,
    mes,
    loadResumo,
    loadCategorias,
}: UseCategoriasGastosRealtimeParams) {
    const handleBatchComplete = useCallback(() => {
        void loadCategorias();
        void loadResumo({ mes });
    }, [loadCategorias, loadResumo, mes]);

    useOrcamentoBatchListener(userId, handleBatchComplete);
}
