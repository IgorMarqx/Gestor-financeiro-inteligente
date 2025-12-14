import { AlertToast } from '@/components/gastos/painel/AlertToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useParcelasHistory } from '@/hooks/gastos-parcelamentos/useParcelasHistory';
import { useMemo } from 'react';

type Props = {
    inicio: string;
    fim: string;
};

export function ParcelasHistory({ inicio, fim }: Props) {
    const { filters, setFilters, data, isLoading, errorMessage } = useParcelasHistory({
        inicio,
        fim,
        status: '',
        page: 1,
        per_page: 15,
    });

    const itens = useMemo(() => data?.itens ?? [], [data?.itens]);

    const statusBadge = (status: 'PENDENTE' | 'GERADO' | 'PAGO') => {
        if (status === 'PAGO') return <Badge className="bg-emerald-600">PAGO</Badge>;
        if (status === 'GERADO') return <Badge variant="secondary">GERADO</Badge>;
        return <Badge variant="outline">PENDENTE</Badge>;
    };

    const resumo = useMemo(() => {
        const total = itens.reduce((acc, p) => acc + Number(p.valor ?? 0), 0);
        const pendentes = itens.filter((p) => p.status === 'PENDENTE').length;
        return { total, pendentes };
    }, [itens]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 rounded-lg border bg-card p-4 sm:grid-cols-3">
                <div className="space-y-1">
                    <Label>Início</Label>
                    <Input
                        type="date"
                        value={filters.inicio}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, inicio: e.target.value, page: 1 }))
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label>Fim</Label>
                    <Input
                        type="date"
                        value={filters.fim}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, fim: e.target.value, page: 1 }))
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label>Status</Label>
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) =>
                            setFilters((f) => ({
                                ...f,
                                status: v === 'all' ? '' : (v as 'PENDENTE' | 'GERADO' | 'PAGO'),
                                page: 1,
                            }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                            <SelectItem value="GERADO">GERADO</SelectItem>
                            <SelectItem value="PAGO">PAGO</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Histórico de parcelas</CardTitle>
                    <p className="text-muted-foreground text-xs">
                        Total listado: R$ {resumo.total.toFixed(2).replace('.', ',')} • Pendentes:{' '}
                        {resumo.pendentes}
                    </p>
                </CardHeader>
                <CardContent className="p-0">
                    {errorMessage ? <AlertToast title="Erro" description={errorMessage} /> : null}

                    {isLoading ? (
                        <div className="p-4 pt-0">
                            <p className="text-muted-foreground text-sm">Carregando...</p>
                        </div>
                    ) : itens.length === 0 ? (
                        <div className="p-4 pt-0">
                            <p className="text-muted-foreground text-sm">
                                Nenhuma parcela no período.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left font-medium">
                                            Vencimento
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Parcelamento
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Parcela
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itens.map((p) => (
                                        <tr key={p.id} className="border-b last:border-b-0">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {p.vencimento}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">
                                                        {p.parcelamento?.nome ??
                                                            `Parcelamento #${p.parcelamento_id}`}
                                                    </p>
                                                    {p.parcelamento?.categoria?.nome ? (
                                                        <p className="text-muted-foreground text-xs">
                                                            {p.parcelamento.categoria.nome}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {p.numero_parcela}/
                                                {p.parcelamento?.parcelas_total ?? '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {statusBadge(p.status)}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap font-semibold">
                                                R$ {Number(p.valor).toFixed(2).replace('.', ',')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {data?.paginacao ? (
                        <div className="flex items-center justify-between p-4">
                            <p className="text-muted-foreground text-xs">
                                Página {data.paginacao.pagina_atual} de {data.paginacao.ultima_pagina}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={(filters.page ?? 1) <= 1}
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
                                    size="sm"
                                    disabled={
                                        (filters.page ?? 1) >= (data.paginacao.ultima_pagina ?? 1)
                                    }
                                    onClick={() =>
                                        setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                                    }
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
