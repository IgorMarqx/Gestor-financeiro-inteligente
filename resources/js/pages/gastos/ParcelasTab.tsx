import { GastosFilters } from '@/components/gastos/painel/GastosFilters';
import { GastoFormModal } from '@/components/gastos/painel/GastoFormModal';
import { GastosToolbar } from '@/components/gastos/painel/GastosToolbar';
import { ParcelasHistory } from '@/components/gastos/parcelas/ParcelasHistory';
import { useGetCategoriasGastos } from '@/hooks/categorias-gastos/useGetCategoriasGastos';
import { useParcelasHistory } from '@/hooks/gastos-parcelamentos/useParcelasHistory';
import { useCreateGastos } from '@/hooks/gastos/useCreateGastos';
import { useUpdateGasto } from '@/hooks/gastos/useUpdateGasto';
import { type GastosFilters as GastosFiltersType } from '@/hooks/gastos/useGastos';
import { type ApiGasto } from '@/types/ApiGasto';
import { useEffect, useMemo, useState } from 'react';

export function ParcelasTab() {
    const {
        createGasto,
        isSubmitting: isCreating,
        errorMessage: createErrorMessage,
    } = useCreateGastos();
    const {
        updateGasto,
        isSubmitting: isUpdating,
        errorMessage: updateErrorMessage,
    } = useUpdateGasto();

    const [editGasto, setEditGasto] = useState<ApiGasto | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

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
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Parcelas</h1>

                <GastosToolbar
                    onCreateClick={() => {
                        setEditGasto(null);
                        setIsFormOpen(true);
                    }}
                />
            </div>

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

            <GastoFormModal
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditGasto(null);
                }}
                gasto={editGasto}
                isSubmitting={isCreating || isUpdating}
                errorMessage={editGasto ? updateErrorMessage : createErrorMessage}
                onSubmit={async (payload) => {
                    if (editGasto) {
                        const updated = await updateGasto(editGasto.id, payload);
                        if (!updated) return false;
                        setEditGasto(null);
                        await reload();
                        return true;
                    }

                    const created = await createGasto(payload);
                    if (!created) return false;
                    await reload();
                    return true;
                }}
            />
        </>
    );
}
