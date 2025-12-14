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
import { ApiCategoriaGasto } from '@/types/ApiCategoriaGasto';
import { GastosFilters as Filters } from '@/hooks/gastos/useGastos';
import { useEffect, useMemo, useState } from 'react';

type Props = {
    filters: Filters;
    categorias: ApiCategoriaGasto[];
    onChange: (patch: Partial<Filters>) => void;
};

export function GastosFilters({ filters, categorias, onChange }: Props) {
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

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                            {categorias.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end justify-end">
                    <Button type="button" onClick={apply} disabled={!canApply} className="w-full sm:w-auto">
                        Filtrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
