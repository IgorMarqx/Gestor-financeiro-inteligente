import { ConfirmDeleteModal } from '@/components/gastos/painel/ConfirmDeleteModal';
import { GastoFormModal } from '@/components/gastos/painel/GastoFormModal';
import { GastosFilters } from '@/components/gastos/painel/GastosFilters';
import { GastosList } from '@/components/gastos/painel/GastosList';
import { GastosToolbar } from '@/components/gastos/painel/GastosToolbar';
import { OrcamentoBars } from '@/components/gastos/painel/OrcamentoBars';
import { SummaryCards } from '@/components/gastos/painel/SummaryCards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetCategoriasGastos } from '@/hooks/categorias-gastos/useGetCategoriasGastos';
import { useCreateGastos } from '@/hooks/gastos/useCreateGastos';
import { useDeleteGasto } from '@/hooks/gastos/useDeleteGasto';
import { useGastos } from '@/hooks/gastos/useGastos';
import { useUpdateGasto } from '@/hooks/gastos/useUpdateGasto';
import { useOrcamentos } from '@/hooks/orcamentos/useOrcamentos';
import { type ApiGasto } from '@/types/ApiGasto';
import { useEffect, useMemo, useState } from 'react';

const formatCurrency = (value: number): string => `R$ ${value.toFixed(2).replace('.', ',')}`;

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

    const categoriaNomePorId = useMemo(() => {
        const map = new Map<number, string>();
        for (const c of categorias) map.set(c.id, c.nome);
        return map;
    }, [categorias]);

    const activeFilterBadges = useMemo(() => {
        const badges: string[] = [];
        if (filters.q) badges.push(`Busca: ${filters.q}`);
        if (filters.categoria_gasto_id) {
            badges.push(`Categoria: ${categoriaNomePorId.get(filters.categoria_gasto_id) ?? filters.categoria_gasto_id}`);
        }
        if (filters.valor_min != null) badges.push(`≥ ${formatCurrency(Number(filters.valor_min))}`);
        if (filters.valor_max != null) badges.push(`≤ ${formatCurrency(Number(filters.valor_max))}`);
        if (filters.somente_recorrentes) badges.push('Recorrentes');
        if (filters.somente_parcelados) badges.push('Parcelados');
        return badges;
    }, [
        categoriaNomePorId,
        filters.categoria_gasto_id,
        filters.q,
        filters.somente_parcelados,
        filters.somente_recorrentes,
        filters.valor_max,
        filters.valor_min,
    ]);

    const topCategorias = useMemo(() => {
        const itens = (data?.totais_por_categoria ?? []).slice();
        itens.sort((a, b) => Number(b.total) - Number(a.total));
        return itens.slice(0, 6);
    }, [data?.totais_por_categoria]);

    return (
        <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">Gastos</h1>
                    <p className="text-sm text-muted-foreground">
                        Acompanhe o total, filtros ativos e a distribuição por categoria.
                    </p>
                </div>

                <GastosToolbar
                    onCreateClick={() => {
                        setEditGasto(null);
                        setIsFormOpen(true);
                    }}
                />
            </div>

            <div className="space-y-4">
                <SummaryCards
                    totalPeriodo={totalPeriodoNumber}
                    media3Meses={media3Meses}
                    periodLabel={periodLabel}
                />

                <GastosFilters
                    filters={filters}
                    categorias={categorias}
                    defaults={{ inicio: defaultInicio, fim: defaultFim }}
                    onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
                    showStatus={false}
                />

                {activeFilterBadges.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {activeFilterBadges.map((label) => (
                            <Badge key={label} variant="secondary">
                                {label}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Sem filtros extras (apenas período).
                    </p>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <GastosList
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
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Página {data.paginacao.pagina_atual} de {data.paginacao.ultima_pagina} • {data.paginacao.total} registros
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
                    </div>

                    <div className="space-y-4">
                        <OrcamentoBars itens={orcamentosResumo} />

                        <div className="rounded-lg border bg-card p-4">
                            <div className="mb-3">
                                <h2 className="text-sm font-semibold">Top categorias</h2>
                                <p className="text-muted-foreground text-xs">
                                    Onde você mais gastou no período.
                                </p>
                            </div>

                            {topCategorias.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sem dados.</p>
                            ) : (
                                <div className="space-y-2">
                                    {topCategorias.map((item) => (
                                        <div key={item.categoria_gasto_id} className="flex items-center justify-between gap-3">
                                            <span className="truncate text-sm">{item.categoria_nome}</span>
                                            <span className="whitespace-nowrap text-sm font-semibold">
                                                {formatCurrency(Number(item.total))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
