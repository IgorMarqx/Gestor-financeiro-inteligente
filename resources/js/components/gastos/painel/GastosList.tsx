import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiGasto } from '@/types/ApiGasto';
import { Pencil, Trash2 } from 'lucide-react';
import { Fragment } from 'react';

type Props = {
    title?: string;
    gastos: ApiGasto[];
    isLoading: boolean;
    errorMessage: string | null;
    onEdit: (gasto: ApiGasto) => void;
    onDelete: (id: number) => void;
};

const formatCurrency = (value: number): string => `R$ ${value.toFixed(2).replace('.', ',')}`;

const formatDatePtBr = (iso: string): string => {
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

export function GastosList({
    title = 'Gastos',
    gastos,
    isLoading,
    errorMessage,
    onEdit,
    onDelete,
}: Props) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Carregando...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (errorMessage) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Erro</CardTitle>
                </CardHeader>
                <CardContent className="text-destructive text-sm">{errorMessage}</CardContent>
            </Card>
        );
    }

    if (gastos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Nenhum gasto</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                    Ajuste os filtros ou crie um novo gasto.
                </CardContent>
            </Card>
        );
    }

    const groups = gastos.reduce(
        (acc, gasto) => {
            const key = gasto.data;
            acc[key] ??= [];
            acc[key].push(gasto);
            return acc;
        },
        {} as Record<string, ApiGasto[]>,
    );

    const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    return (
        <>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left font-medium">Nome</th>
                                    <th className="px-4 py-3 text-left font-medium">Categoria</th>
                                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dates.map((date) => {
                                    const items = groups[date] ?? [];
                                    const totalDia = items.reduce(
                                        (sum, g) => sum + Number(g.valor ?? 0),
                                        0,
                                    );

                                    return (
                                        <Fragment key={date}>
                                            <tr key={`group-${date}`} className="bg-muted/30 border-b">
                                                <td className="px-4 py-2 text-xs text-muted-foreground font-medium" colSpan={4}>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span>{formatDatePtBr(date)}</span>
                                                        <span className="whitespace-nowrap">
                                                            Total do dia: {formatCurrency(totalDia)}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {items.map((g) => (
                                                <tr key={g.id} className="border-b last:border-b-0">
                                                    <td className="px-4 py-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">{g.nome}</p>
                                                            {g.descricao ? (
                                                                <p className="text-muted-foreground line-clamp-1 text-xs">
                                                                    {g.descricao}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {g.categoria?.nome ? (
                                                                <Badge variant="secondary">{g.categoria.nome}</Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">
                                                                    —
                                                                </span>
                                                            )}
                                                            {g.metodo_pagamento ? (
                                                                <Badge variant="outline">{g.metodo_pagamento}</Badge>
                                                            ) : null}
                                                            {g.tipo ? <Badge variant="outline">{g.tipo}</Badge> : null}
                                                            {g.necessidade ? (
                                                                <Badge variant="outline">{g.necessidade}</Badge>
                                                            ) : null}
                                                            {g.origem_tipo === 'RECORRENTE' ? (
                                                                <Badge>Recorrente</Badge>
                                                            ) : null}
                                                            {g.origem_tipo === 'PARCELA' ? (
                                                                <Badge>Parcela</Badge>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap font-semibold">
                                                        {formatCurrency(Number(g.valor))}
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                                        <div className="inline-flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9"
                                                                onClick={() => onEdit(g)}
                                                                aria-label="Editar gasto"
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="h-9 w-9"
                                                                onClick={() => onDelete(g.id)}
                                                                aria-label="Deletar gasto"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
