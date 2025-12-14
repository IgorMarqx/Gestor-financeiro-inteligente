import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { useState } from 'react';

type Props = {
    filters: Filters;
    categorias: ApiCategoriaGasto[];
    onChange: (patch: Partial<Filters>) => void;
};

export function GastosFilters({ filters, categorias, onChange }: Props) {
    const [advancedOpen, setAdvancedOpen] = useState(false);

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
                <Label>Início</Label>
                <Input
                    type="date"
                    value={filters.inicio}
                    onChange={(e) => onChange({ inicio: e.target.value, page: 1 })}
                />
            </div>
            <div className="space-y-1">
                <Label>Fim</Label>
                <Input
                    type="date"
                    value={filters.fim}
                    onChange={(e) => onChange({ fim: e.target.value, page: 1 })}
                />
            </div>
            <div className="space-y-1">
                <Label>Categoria</Label>
                <Select
                    value={filters.categoria_gasto_id ? String(filters.categoria_gasto_id) : 'all'}
                    onValueChange={(v) =>
                        onChange({
                            categoria_gasto_id: v === 'all' ? null : Number(v),
                            page: 1,
                        })
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
            <div className="space-y-1">
                <Label>Ordenar</Label>
                <div className="flex gap-2">
                    <Select
                        value={filters.order_by ?? 'data'}
                        onValueChange={(v) =>
                            onChange({ order_by: v as Filters['order_by'], page: 1 })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="data">Data</SelectItem>
                            <SelectItem value="valor">Valor</SelectItem>
                            <SelectItem value="categoria">Categoria</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.order_dir ?? 'desc'}
                        onValueChange={(v) =>
                            onChange({ order_dir: v as Filters['order_dir'], page: 1 })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Desc</SelectItem>
                            <SelectItem value="asc">Asc</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            </div>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <div className="mt-3 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs">
                        Mostre/oculte opções menos usadas.
                    </p>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" type="button">
                            {advancedOpen ? 'Ocultar filtros avançados' : 'Filtros avançados'}
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <Label>Valor mín.</Label>
                            <Input
                                inputMode="decimal"
                                value={filters.valor_min ?? ''}
                                onChange={(e) =>
                                    onChange({
                                        valor_min: e.target.value === '' ? null : Number(e.target.value),
                                        page: 1,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Valor máx.</Label>
                            <Input
                                inputMode="decimal"
                                value={filters.valor_max ?? ''}
                                onChange={(e) =>
                                    onChange({
                                        valor_max: e.target.value === '' ? null : Number(e.target.value),
                                        page: 1,
                                    })
                                }
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox
                                checked={!!filters.somente_recorrentes}
                                onCheckedChange={(checked) =>
                                    onChange({ somente_recorrentes: !!checked, page: 1 })
                                }
                                id="somente_recorrentes"
                            />
                            <Label htmlFor="somente_recorrentes">Somente recorrentes</Label>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox
                                checked={!!filters.somente_parcelados}
                                onCheckedChange={(checked) =>
                                    onChange({ somente_parcelados: !!checked, page: 1 })
                                }
                                id="somente_parcelados"
                            />
                            <Label htmlFor="somente_parcelados">Somente parcelados</Label>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
