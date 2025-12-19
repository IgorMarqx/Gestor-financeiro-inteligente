import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ApiCategoriaGasto } from '@/types/ApiCategoriaGasto';
import { GastosFilters as Filters } from '@/hooks/gastos/useGastos';
import { useEffect, useMemo, useState } from 'react';

type Props = {
    filters: Filters;
    categorias?: ApiCategoriaGasto[];
    onChange: (patch: Partial<Filters>) => void;
    showStatus?: boolean;
    status?: 'PENDENTE' | 'GERADO' | 'PAGO' | '';
    onStatusChange?: (status: 'PENDENTE' | 'GERADO' | 'PAGO' | '') => void;
    defaults?: { inicio: string; fim: string };
};

export function GastosFilters({
    filters,
    categorias,
    onChange,
    showStatus,
    status,
    onStatusChange,
    defaults,
}: Props) {
    const [draft, setDraft] = useState<Filters>(filters);

    useEffect(() => {
        setDraft(filters);
    }, [filters]);

    const canApply = useMemo(() => {
        return Boolean(draft.inicio && draft.fim);
    }, [draft.inicio, draft.fim]);

    const apply = () => {
        onChange({ ...draft, page: 1 });
    };

    const clear = () => {
        const inicio = defaults?.inicio ?? filters.inicio;
        const fim = defaults?.fim ?? filters.fim;

        onChange({
            inicio,
            fim,
            categoria_gasto_id: null,
            valor_min: null,
            valor_max: null,
            q: '',
            somente_recorrentes: false,
            somente_parcelados: false,
            order_by: 'data',
            order_dir: 'desc',
            page: 1,
        });
    };

    return (
        <div className="rounded-lg border bg-card p-4 sticky top-3 z-10">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <div className="space-y-1 lg:col-span-2">
                    <Label>Busca</Label>
                    <Input
                        placeholder="Nome ou descrição..."
                        value={draft.q ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Início</Label>
                    <Input
                        type="date"
                        value={draft.inicio}
                        onChange={(e) => setDraft((d) => ({ ...d, inicio: e.target.value }))}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Fim</Label>
                    <Input
                        type="date"
                        value={draft.fim}
                        onChange={(e) => setDraft((d) => ({ ...d, fim: e.target.value }))}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Categoria</Label>
                    <Select
                        value={draft.categoria_gasto_id ? String(draft.categoria_gasto_id) : 'all'}
                        onValueChange={(v) =>
                            setDraft((d) => ({
                                ...d,
                                categoria_gasto_id: v === 'all' ? null : Number(v),
                            }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {(categorias ?? []).map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label>Valor mín.</Label>
                    <Input
                        inputMode="decimal"
                        placeholder="0,00"
                        value={draft.valor_min ?? ''}
                        onChange={(e) =>
                            setDraft((d) => ({
                                ...d,
                                valor_min: e.target.value === '' ? null : Number(e.target.value),
                            }))
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label>Valor máx.</Label>
                    <Input
                        inputMode="decimal"
                        placeholder="0,00"
                        value={draft.valor_max ?? ''}
                        onChange={(e) =>
                            setDraft((d) => ({
                                ...d,
                                valor_max: e.target.value === '' ? null : Number(e.target.value),
                            }))
                        }
                    />
                </div>
                {showStatus ? (
                    <div className="space-y-1">
                        <Label>Status</Label>
                        <Select
                            value={status || 'all'}
                            onValueChange={(v) =>
                                onStatusChange?.(
                                    v === 'all'
                                        ? ''
                                        : (v as 'PENDENTE' | 'GERADO' | 'PAGO'),
                                )
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
                ) : null}

                <div className="flex items-end justify-start gap-2">
                    <Button type="button" onClick={apply} disabled={!canApply} className="w-full sm:w-auto">
                        Aplicar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={clear}
                        className="w-full sm:w-auto"
                    >
                        Limpar
                    </Button>
                </div>
            </div>

            {!showStatus ? (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <ToggleGroup
                            type="multiple"
                            value={[
                                draft.somente_recorrentes ? 'recorrentes' : '',
                                draft.somente_parcelados ? 'parcelados' : '',
                            ].filter(Boolean)}
                            onValueChange={(values) =>
                                setDraft((d) => ({
                                    ...d,
                                    somente_recorrentes: values.includes('recorrentes'),
                                    somente_parcelados: values.includes('parcelados'),
                                }))
                            }
                        >
                            <ToggleGroupItem value="recorrentes">Recorrentes</ToggleGroupItem>
                            <ToggleGroupItem value="parcelados">Parcelados</ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="space-y-1 sm:w-52">
                            <Label>Ordenar</Label>
                            <Select
                                value={`${draft.order_by ?? 'data'}:${draft.order_dir ?? 'desc'}`}
                                onValueChange={(v) => {
                                    const [order_by, order_dir] = v.split(':');
                                    setDraft((d) => ({
                                        ...d,
                                        order_by: (order_by as Filters['order_by']) ?? 'data',
                                        order_dir: (order_dir as Filters['order_dir']) ?? 'desc',
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Ordenação" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="data:desc">Data (mais recente)</SelectItem>
                                    <SelectItem value="data:asc">Data (mais antiga)</SelectItem>
                                    <SelectItem value="valor:desc">Valor (maior)</SelectItem>
                                    <SelectItem value="valor:asc">Valor (menor)</SelectItem>
                                    <SelectItem value="categoria:asc">Categoria (A–Z)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
