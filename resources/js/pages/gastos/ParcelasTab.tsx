import { GastosFilters } from '@/components/gastos/painel/GastosFilters';
import { ParcelasHistory } from '@/components/gastos/parcelas/ParcelasHistory';
import { useGetCategoriasGastos } from '@/hooks/categorias-gastos/useGetCategoriasGastos';
import { useParcelasHistory } from '@/hooks/gastos-parcelamentos/useParcelasHistory';
import { type GastosFilters as GastosFiltersType } from '@/hooks/gastos/useGastos';
import { useEffect, useMemo } from 'react';

export function ParcelasTab() {
    const now = useMemo(() => new Date(), []);
    const defaultInicio = useMemo(() => {
        const d = new Date(now.getFullYear(), now.getMonth(), 1);
        return d.toISOString().slice(0, 10);
    }, [now]);
    const defaultFim = useMemo(() => {
        const d = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return d.toISOString().slice(0, 10);
    }, [now]);

    const { loadCategorias, categorias } = useGetCategoriasGastos();

    useEffect(() => {
        void loadCategorias();
    }, []);

    const { filters, setFilters, data, isLoading, errorMessage, reload } = useParcelasHistory({
        inicio: defaultInicio,
        fim: defaultFim,
        status: '',
        page: 1,
        per_page: 15,
    });

    const gastosFilters: GastosFiltersType = useMemo(
        () => ({
            inicio: filters.inicio,
            fim: filters.fim,
            categoria_gasto_id: null,
            page: 1,
            per_page: 15,
            order_by: 'data',
            order_dir: 'desc',
            q: '',
        }),
        [filters.inicio, filters.fim],
    );

    useEffect(() => {
        void reload();
    }, [filters]);

    return (
        <>
            <h1 className="text-xl font-semibold">Parcelas</h1>

            <GastosFilters
                filters={gastosFilters}
                categorias={categorias}
                onChange={(patch) =>
                    setFilters((f) => ({
                        ...f,
                        inicio: patch.inicio ?? f.inicio,
                        fim: patch.fim ?? f.fim,
                        page: 1,
                    }))
                }
                showStatus
                status={filters.status ?? ''}
                onStatusChange={(status) => setFilters((f) => ({ ...f, status, page: 1 }))}
            />

            <ParcelasHistory
                filters={filters}
                setFilters={setFilters}
                data={data}
                isLoading={isLoading}
                errorMessage={errorMessage}
            />
        </>
    );
}
