import { ConfirmDeleteModal } from '@/components/gastos/painel/ConfirmDeleteModal';
import { GastoFormModal } from '@/components/gastos/painel/GastoFormModal';
import { GastosList } from '@/components/gastos/painel/GastosList';
import { GastosToolbar } from '@/components/gastos/painel/GastosToolbar';
import { OrcamentoBars } from '@/components/gastos/painel/OrcamentoBars';
import { SummaryCards } from '@/components/gastos/painel/SummaryCards';
import { Button } from '@/components/ui/button';
import { useGetCategoriasGastos } from '@/hooks/categorias-gastos/useGetCategoriasGastos';
import { useCreateGastos } from '@/hooks/gastos/useCreateGastos';
import { useDeleteGasto } from '@/hooks/gastos/useDeleteGasto';
import { useGastos } from '@/hooks/gastos/useGastos';
import { useUpdateGasto } from '@/hooks/gastos/useUpdateGasto';
import { useOrcamentos } from '@/hooks/orcamentos/useOrcamentos';
import { type ApiGasto } from '@/types/ApiGasto';
import { useEffect, useMemo, useState } from 'react';

export function GastosTab() {
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
    const {
        deleteGasto,
        isSubmitting: isDeleting,
        errorMessage: deleteErrorMessage,
    } = useDeleteGasto();

    const [deleteId, setDeleteId] = useState<number | null>(null);
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

    const { filters, setFilters, data, isLoading, errorMessage, reload } = useGastos({
        inicio: defaultInicio,
        fim: defaultFim,
        q: '',
        page: 1,
        per_page: 15,
        order_by: 'data',
        order_dir: 'desc',
    });

    const mes = useMemo(() => filters.inicio.slice(0, 7), [filters.inicio]);
    const { resumo: orcamentosResumo } = useOrcamentos(mes);

    const totalPeriodoNumber = useMemo(() => Number(data?.total_periodo ?? 0), [data?.total_periodo]);
    const media3Meses = useMemo(() => totalPeriodoNumber / 3, [totalPeriodoNumber]);
    const periodLabel = useMemo(() => {
        const inicio = data?.periodo.inicio ?? filters.inicio;
        const fim = data?.periodo.fim ?? filters.fim;
        return `${inicio} → ${fim}`;
    }, [data?.periodo.inicio, data?.periodo.fim, filters.inicio, filters.fim]);

    return (
        <>
            <div className="space-y-1 flex justify-between">
                <h1 className="text-xl font-semibold">Painel de gastos</h1>

                <GastosToolbar
                    onCreateClick={() => {
                        setEditGasto(null);
                        setIsFormOpen(true);
                    }}
                />
            </div>

            <SummaryCards
                totalPeriodo={totalPeriodoNumber}
                media3Meses={media3Meses}
                periodLabel={periodLabel}
            />

            <OrcamentoBars itens={orcamentosResumo} />
            <GastosList
                filters={filters}
                categorias={categorias}
                onFiltersChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
                showStatus={false}
                gastos={data?.gastos ?? []}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onEdit={(g) => {
                    setEditGasto(g);
                    setIsFormOpen(true);
                }}
                onDelete={(id) => setDeleteId(id)}
            />

            {data?.paginacao ? (
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                        Página {data.paginacao.pagina_atual} de {data.paginacao.ultima_pagina}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={data.paginacao.pagina_atual <= 1}
                            onClick={() =>
                                setFilters((f) => ({
                                    ...f,
                                    page: Math.max(1, (f.page ?? 1) - 1),
                                }))
                            }
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            disabled={data.paginacao.pagina_atual >= data.paginacao.ultima_pagina}
                            onClick={() =>
                                setFilters((f) => ({
                                    ...f,
                                    page: (f.page ?? 1) + 1,
                                }))
                            }
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            ) : null}

            <ConfirmDeleteModal
                open={deleteId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteId(null);
                }}
                isDeleting={isDeleting}
                errorMessage={deleteErrorMessage}
                onConfirm={async () => {
                    if (deleteId === null) return;
                    const ok = await deleteGasto(deleteId);
                    if (!ok) return;
                    setDeleteId(null);
                    await reload();
                }}
            />

            <GastoFormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
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
