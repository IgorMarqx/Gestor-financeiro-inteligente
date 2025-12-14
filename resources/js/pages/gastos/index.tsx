import AppLayout from '@/layouts/app-layout';
import { GastoCreateDialog } from '@/components/gastos/gasto-create-dialog';
import { GastoEditDialog } from '@/components/gastos/gasto-edit-dialog';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useGetGastos } from '@/hooks/gastos/useGetGastos';
import { useCreateGastos } from '@/hooks/gastos/useCreateGastos';
import { useUpdateGasto } from '@/hooks/gastos/useUpdateGasto';
import { useDeleteGasto } from '@/hooks/gastos/useDeleteGasto';
import { type ApiGasto } from '@/types/ApiGasto';
import { Pencil, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Gastos', href: '/gastos' }];

export default function GastosIndex() {
    const { loadGastos, isLoading, errorMessage, gastos } = useGetGastos();
    const {
        createGasto,
        isSubmitting,
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

    const total = useMemo(() => {
        return gastos.reduce((acc, gasto) => acc + Number(gasto.valor ?? 0), 0);
    }, [gastos]);

    const formatDate = (iso: string): string => {
        const [y, m, d] = iso.split('-');
        if (!y || !m || !d) return iso;
        return `${d}/${m}/${y}`;
    };

    const formatMoney = (value: string): string =>
        `R$ ${Number(value).toFixed(2).replace('.', ',')}`;

    useEffect(() => {
        void loadGastos();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gastos" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold">Gastos</h1>
                        <p className="text-muted-foreground text-sm">
                            Total: R$ {total.toFixed(2).replace('.', ',')}
                        </p>
                    </div>

                    <GastoCreateDialog
                        onCreate={createGasto}
                        onCreated={() => void loadGastos()}
                        isSubmitting={isSubmitting}
                        errorMessage={createErrorMessage}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        <Card className="border-emerald-100/80 dark:border-emerald-900/40">
                            <CardHeader>
                                <CardTitle className="text-base">Carregando...</CardTitle>
                            </CardHeader>
                        </Card>
                    ) : errorMessage ? (
                        <Card className="border-emerald-100/80 dark:border-emerald-900/40">
                            <CardHeader>
                                <CardTitle className="text-base">Erro</CardTitle>
                            </CardHeader>
                            <CardContent className="text-destructive text-sm">
                                {errorMessage}
                            </CardContent>
                        </Card>
                    ) : gastos.length === 0 ? (
                        <Card className="border-emerald-100/80 dark:border-emerald-900/40">
                            <CardHeader>
                                <CardTitle className="text-base">Nenhum gasto ainda</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                Crie seu primeiro gasto para começar.
                            </CardContent>
                        </Card>
                    ) : (
                        gastos.map((gasto) => (
                            <Card
                                key={gasto.id}
                                className="group overflow-hidden border-emerald-100/80 shadow-sm transition hover:-translate-y-px hover:border-emerald-200 hover:shadow-md dark:border-emerald-900/40 dark:hover:border-emerald-700/50"
                            >
                                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3 sm:hidden">
                                            <div className="min-w-0">
                                                <p className="truncate text-base font-semibold">
                                                    {gasto.nome}
                                                </p>
                                                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                    <span>{formatDate(gasto.data)}</span>
                                                    {gasto.categoria?.nome ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="h-5 border border-emerald-200/70 bg-emerald-50 px-2 text-[11px] text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-50"
                                                        >
                                                            {gasto.categoria.nome}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <p className="shrink-0 text-right text-base font-semibold">
                                                {formatMoney(gasto.valor)}
                                            </p>
                                        </div>

                                        <div className="hidden sm:flex sm:items-start sm:justify-between sm:gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-base font-semibold">
                                                    {gasto.nome}
                                                </p>
                                                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-900 ring-1 ring-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-50 dark:ring-emerald-800/60">
                                                        {formatDate(gasto.data)}
                                                    </span>
                                                    {gasto.categoria?.nome ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="h-5 border border-emerald-200/70 bg-emerald-50 px-2 text-[11px] text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-50"
                                                        >
                                                            {gasto.categoria.nome}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <p className="shrink-0 text-right text-base font-semibold">
                                                {formatMoney(gasto.valor)}
                                            </p>
                                        </div>

                                        {gasto.descricao ? (
                                            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                                                {gasto.descricao}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 sm:justify-start">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={() => setEditGasto(gasto)}
                                            aria-label="Editar gasto"
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={() => setDeleteId(gasto.id)}
                                            aria-label="Deletar gasto"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteId(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Deletar gasto</DialogTitle>
                        <DialogDescription>
                            Essa ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteErrorMessage ? (
                        <p className="text-destructive text-sm">{deleteErrorMessage}</p>
                    ) : null}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isDeleting || deleteId === null}
                            onClick={async () => {
                                if (deleteId === null) return;
                                const ok = await deleteGasto(deleteId);
                                if (!ok) return;
                                setDeleteId(null);
                                void loadGastos();
                            }}
                        >
                            {isDeleting ? 'Deletando...' : 'Deletar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <GastoEditDialog
                open={editGasto !== null}
                onOpenChange={(open) => {
                    if (!open) setEditGasto(null);
                }}
                gasto={editGasto}
                isSubmitting={isUpdating}
                errorMessage={updateErrorMessage}
                onSubmit={async (payload) => {
                    if (!editGasto) return false;
                    const updated = await updateGasto(editGasto.id, payload);
                    if (!updated) return false;
                    setEditGasto(null);
                    void loadGastos();
                    return true;
                }}
            />
        </AppLayout>
    );
}
