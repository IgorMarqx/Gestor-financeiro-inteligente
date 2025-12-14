import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiGasto } from '@/types/ApiGasto';
import { Pencil, Trash2 } from 'lucide-react';

type Props = {
    gastos: ApiGasto[];
    isLoading: boolean;
    errorMessage: string | null;
    onEdit: (gasto: ApiGasto) => void;
    onDelete: (id: number) => void;
};

export function GastosList({ gastos, isLoading, errorMessage, onEdit, onDelete }: Props) {
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

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Gastos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left font-medium">Data</th>
                                <th className="px-4 py-3 text-left font-medium">Nome</th>
                                <th className="px-4 py-3 text-left font-medium">Categoria</th>
                                <th className="px-4 py-3 text-right font-medium">Valor</th>
                                <th className="px-4 py-3 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gastos.map((g) => (
                                <tr key={g.id} className="border-b last:border-b-0">
                                    <td className="px-4 py-3 whitespace-nowrap">{g.data}</td>
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
                                            {g.origem_tipo === 'RECORRENTE' ? (
                                                <Badge>Recorrente</Badge>
                                            ) : null}
                                            {g.origem_tipo === 'PARCELA' ? (
                                                <Badge>Parcela</Badge>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap font-semibold">
                                        R$ {Number(g.valor).toFixed(2).replace('.', ',')}
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
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
