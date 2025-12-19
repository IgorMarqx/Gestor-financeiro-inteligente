import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateCategoriaGasto } from '@/hooks/categorias-gastos/useCreateCategoriaGasto';
import { useGetCategoriasGastos } from '@/hooks/categorias-gastos/useGetCategoriasGastos';
import { useGetCategoriasGastosResumo } from '@/hooks/categorias-gastos/useGetCategoriasGastosResumo';
import { useGetGastosPorCategoria } from '@/hooks/categorias-gastos/useGetGastosPorCategoria';
import { useExportCategoriaGastosCsv } from '@/hooks/categorias-gastos/useExportCategoriaGastosCsv';
import { monthToLabel, parseApiDecimal } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CategoriasResumoCards } from '@/pages/categorias-gastos/components/CategoriasResumoCards';
import { CategoriasResumoLista } from '@/pages/categorias-gastos/components/CategoriasResumoLista';
import { CriarCategoriaDialog } from '@/pages/categorias-gastos/components/CriarCategoriaDialog';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Categorias', href: '/categorias' }];

export default function CategoriasGastosIndex() {
    const { loadCategorias } = useGetCategoriasGastos();
    const {
        loadResumo,
        isLoading: isResumoLoading,
        errorMessage: resumoErrorMessage,
        resumo,
    } = useGetCategoriasGastosResumo();
    const { loadGastos, gastosByCategoria, isLoadingByCategoria, errorByCategoria } =
        useGetGastosPorCategoria();
    const { exportCsv, isExporting: isExportingCsv } = useExportCategoriaGastosCsv();
    const {
        createCategoria,
        isSubmitting,
        errorMessage: createErrorMessage,
    } = useCreateCategoriaGasto();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [nome, setNome] = useState('');
    const [query, setQuery] = useState('');
    const [expandedCategoriaId, setExpandedCategoriaId] = useState<number | null>(null);
    const [mes, setMes] = useState<string>(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}`;
    });

    useEffect(() => {
        void loadCategorias();
    }, [loadCategorias]);

    useEffect(() => {
        void loadResumo({ mes });
    }, [loadResumo, mes]);

    const onCreate = async () => {
        const created = await createCategoria({ nome: nome.trim() });
        if (!created) return;

        setIsDialogOpen(false);
        setNome('');
        void loadResumo({ mes });
    };

    const onExportCsv = async (id: number, categoriaNome?: string) => {
        await exportCsv(id, { mes, categoriaNome });
    };

    const maxGasto = useMemo(() => {
        if (!resumo?.categorias?.length) return 0;
        return Math.max(...resumo.categorias.map((c) => parseApiDecimal(c.gasto_total)));
    }, [resumo]);

    const filteredResumoCategorias = useMemo(() => {
        if (!resumo?.categorias) return [];
        const q = query.trim().toLowerCase();
        if (!q) return resumo.categorias;
        return resumo.categorias.filter((c) => c.nome.toLowerCase().includes(q));
    }, [query, resumo]);

    const onToggleExpand = async (categoriaId: number) => {
        const willExpand = expandedCategoriaId !== categoriaId;
        setExpandedCategoriaId(willExpand ? categoriaId : null);
        if (!willExpand) return;
        if (gastosByCategoria[categoriaId]?.length) return;
        await loadGastos(categoriaId, { mes, limit: 50 });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorias" />

            <div className="mx-auto flex w-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold">Categorias</h1>
                        <p className="text-muted-foreground text-sm">
                            Organize seus gastos por categoria.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="w-full sm:w-auto">
                            <label className="text-muted-foreground mb-1 block text-xs">
                                Mês
                            </label>
                            <Input
                                type="month"
                                value={mes}
                                onChange={(e) => setMes(e.target.value)}
                                className="w-full sm:w-[200px]"
                            />
                            <p className="text-muted-foreground mt-1 text-xs">
                                {monthToLabel(mes)}
                            </p>
                        </div>

                        <CriarCategoriaDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            nome={nome}
                            onNomeChange={setNome}
                            errorMessage={createErrorMessage}
                            isSubmitting={isSubmitting}
                            onCancel={() => setIsDialogOpen(false)}
                            onSubmit={onCreate}
                        />
                    </div>
                </div>

                <div className="relative">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquisar categorias..."
                        className="pl-9"
                    />
                </div>

                {isResumoLoading ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Carregando resumo...</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                ) : resumoErrorMessage ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Erro no resumo</CardTitle>
                        </CardHeader>
                        <CardContent className="text-destructive text-sm">
                            {resumoErrorMessage}
                        </CardContent>
                    </Card>
                ) : resumo ? (
                    <>
                        <CategoriasResumoCards
                            totalGasto={resumo.totais.gasto_total}
                            categoriasCount={resumo.totais.categorias}
                        />
                        <CategoriasResumoLista
                            categorias={filteredResumoCategorias}
                            maxGasto={maxGasto}
                            expandedId={expandedCategoriaId}
                            onToggleExpand={onToggleExpand}
                            gastosByCategoria={gastosByCategoria}
                            isLoadingByCategoria={isLoadingByCategoria}
                            errorByCategoria={errorByCategoria}
                            onExportCsv={onExportCsv}
                            mes={mes}
                            onResumoChange={async () => {
                                await loadResumo({ mes });
                            }}
                            isExportingCsv={isExportingCsv}
                        />
                    </>
                ) : null}
            </div>
        </AppLayout>
    );
}
