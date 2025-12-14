import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApiGasto } from '@/types/ApiGasto';
import { Pencil, Trash2 } from 'lucide-react';
import { getGastoBadges } from './types';

type Props = {
    gasto: ApiGasto;
    onEdit: (gasto: ApiGasto) => void;
    onDelete: (id: number) => void;
};

export function GastoCard({ gasto, onEdit, onDelete }: Props) {
    const badges = getGastoBadges(gasto);

    return (
        <Card className="group overflow-hidden border-emerald-100/80 shadow-sm transition hover:-translate-y-px hover:border-emerald-200 hover:shadow-md dark:border-emerald-900/40 dark:hover:border-emerald-700/50">
            <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{gasto.nome}</p>
                            <p className="text-muted-foreground text-xs">{gasto.data}</p>
                        </div>
                        <p className="shrink-0 text-right text-sm font-semibold">
                            R$ {Number(gasto.valor).toFixed(2).replace('.', ',')}
                        </p>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {gasto.categoria?.nome ? (
                            <Badge variant="secondary">{gasto.categoria.nome}</Badge>
                        ) : null}
                        {badges.isRecorrente ? <Badge>Recorrente</Badge> : null}
                        {badges.isParcela ? <Badge>Parcela</Badge> : null}
                        {gasto.metodo_pagamento ? (
                            <Badge variant="outline">{gasto.metodo_pagamento}</Badge>
                        ) : null}
                        {gasto.tipo ? <Badge variant="outline">{gasto.tipo}</Badge> : null}
                        {gasto.necessidade ? (
                            <Badge variant="outline">{gasto.necessidade}</Badge>
                        ) : null}
                    </div>

                    {gasto.descricao ? (
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                            {gasto.descricao}
                        </p>
                    ) : null}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => onEdit(gasto)}
                        aria-label="Editar gasto"
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => onDelete(gasto.id)}
                        aria-label="Deletar gasto"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

