import AppLayout from '@/layouts/app-layout';
import { GastoCreateDialog } from '@/components/gastos/gasto-create-dialog';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetGastos } from '@/hooks/gastos/useGetGastos';
import { useCreateGastos } from '@/hooks/gastos/useCreateGastos';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Gastos', href: '/gastos' }];

export default function GastosIndex() {
    const { loadGastos, isLoading, errorMessage, gastos } = useGetGastos();
    const {
        createGasto,
        isSubmitting,
        errorMessage: createErrorMessage,
    } = useCreateGastos();

    const total = useMemo(() => {
        return gastos.reduce((acc, gasto) => acc + Number(gasto.valor ?? 0), 0);
    }, [gastos]);

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

                <div className="grid grid-cols-1 gap-3">
                    {isLoading ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Carregando...</CardTitle>
                            </CardHeader>
                        </Card>
                    ) : errorMessage ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Erro</CardTitle>
                            </CardHeader>
                            <CardContent className="text-destructive text-sm">
                                {errorMessage}
                            </CardContent>
                        </Card>
                    ) : gastos.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Nenhum gasto ainda</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                Crie seu primeiro gasto para começar.
                            </CardContent>
                        </Card>
                    ) : (
                        gastos.map((gasto) => (
                            <Card key={gasto.id} className="overflow-hidden">
                                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{gasto.nome}</p>
                                        <div className="text-muted-foreground flex flex-wrap gap-x-2 text-xs">
                                            <span>{gasto.data}</span>
                                            {gasto.categoria?.nome ? (
                                                <span>• {gasto.categoria.nome}</span>
                                            ) : null}
                                        </div>
                                        {gasto.descricao ? (
                                            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                                {gasto.descricao}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-semibold">
                                            R$ {Number(gasto.valor).toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
