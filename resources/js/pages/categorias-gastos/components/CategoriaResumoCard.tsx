import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyBRL, parseApiDecimal } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ApiCategoriaGastoResumo } from '@/types/ApiCategoriaGastoResumo';
import { ChevronDown, ChevronUp, Download, Info, Pencil, Trash2 } from 'lucide-react';
import { CategoriaGastosDetalhados } from '@/pages/categorias-gastos/components/CategoriaGastosDetalhados';
import { ApiGastoResumoItem } from '@/types/ApiGastoResumoItem';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function statusLabel(status: ApiCategoriaGastoResumo['status']): string {
    if (status === 'estourou') return 'Estourou';
    if (status === 'alerta80') return 'Alerta 80%';
    if (status === 'ok') return 'Ok';
    return 'Sem orçamento';
}

function iconForCategoria(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('alim') || lower.includes('comida') || lower.includes('merc')) return '🍽️';
    if (lower.includes('trans') || lower.includes('uber') || lower.includes('car')) return '🚗';
    if (lower.includes('lazer') || lower.includes('diver') || lower.includes('cin')) return '🎬';
    if (lower.includes('saúde') || lower.includes('saude') || lower.includes('farm')) return '💊';
    if (lower.includes('casa') || lower.includes('alug')) return '🏠';
    return '🏷️';
}

function Sparkline(props: { values: number[] }) {
    const points = useMemo(() => {
        if (!props.values.length) return '';
        const max = Math.max(...props.values, 1);
        const width = 110;
        const height = 26;
        return props.values
            .map((v, i) => {
                const x = (i / Math.max(1, props.values.length - 1)) * width;
                const y = height - (v / max) * height;
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(' ');
    }, [props.values]);

    return (
        <svg width="110" height="26" viewBox="0 0 110 26" className="shrink-0">
            <polyline
                fill="none"
                stroke="#009D69"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={points}
            />
        </svg>
    );
}

export function CategoriaResumoCard(props: {
    categoria: ApiCategoriaGastoResumo;
    expanded: boolean;
    onToggle: () => void;
    gastos: ApiGastoResumoItem[];
    isLoadingGastos: boolean;
    errorGastos: string | null;
    maxGasto: number;
    onEdit: (id: number, nome: string) => Promise<void> | void;
    onDelete: (id: number) => Promise<void> | void;
    onExportCsv: (id: number, categoriaNome?: string) => Promise<void> | void;
    isEditing?: boolean;
    isDeleting?: boolean;
    isExportingCsv?: boolean;
}) {
    const gasto = parseApiDecimal(props.categoria.gasto_total);
    const limite = props.categoria.orcamento_limite
        ? parseApiDecimal(props.categoria.orcamento_limite)
        : null;
    const percentual = props.categoria.orcamento_percentual ?? null;
    const bar = props.maxGasto > 0 ? Math.min(100, (gasto / props.maxGasto) * 100) : 0;

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [nome, setNome] = useState(props.categoria.nome);

    const serieValues = useMemo(
        () => (props.categoria.serie_30d ?? []).map((v) => parseApiDecimal(v)),
        [props.categoria.serie_30d],
    );

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="flex items-start justify-between gap-3 p-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className="grid size-12 place-items-center rounded-2xl text-xl"
                            style={{ backgroundColor: '#009D69' }}
                        >
                            <span className="translate-y-[1px]">{iconForCategoria(props.categoria.nome)}</span>
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold">{props.categoria.nome}</p>
                            <p className="text-muted-foreground text-xs">
                                {props.categoria.gastos_count} gasto(s) • {statusLabel(props.categoria.status)}
                            </p>
                            <p className="mt-1 text-lg font-bold">{formatCurrencyBRL(gasto)}</p>
                            <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                <span>{props.categoria.participacao_percentual}% do total</span>
                                <span>
                                    Média/gasto{' '}
                                    {formatCurrencyBRL(parseApiDecimal(props.categoria.media_por_gasto))}
                                </span>
                                <span>
                                    Maior{' '}
                                    {formatCurrencyBRL(parseApiDecimal(props.categoria.maior_gasto))}
                                </span>
                            </div>
                            {limite !== null ? (
                                <p className="text-muted-foreground text-xs">
                                    Limite {formatCurrencyBRL(limite)}
                                    {percentual !== null ? ` • ${percentual}%` : ''}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Sparkline values={serieValues} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:bg-blue-100 hover:text-blue-900 cursor-pointer"
                            onClick={() => {
                                setNome(props.categoria.nome);
                                setIsEditOpen(true);
                            }}
                            disabled={props.isEditing || props.isDeleting}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:bg-red-100 hover:text-red-500 cursor-pointer"
                            onClick={() => setIsDeleteOpen(true)}
                            disabled={props.isDeleting || props.isEditing}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={props.onToggle} className="text-muted-foreground">
                            {props.expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                    </div>
                </div>

                <div className="px-4 pb-4">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-muted-foreground text-xs">
                            Intensidade de gasto
                        </p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                                    aria-label="Explicação da barra"
                                >
                                    <Info className="size-3.5" />
                                    O que é isso?
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Barra comparativa: mostra o gasto desta categoria em relação à categoria que mais gastou no período (100%).
                                Para acompanhar orçamento (limite), use o percentual mostrado ao lado do limite quando existir.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                        <div
                            className={cn('h-2 rounded-full')}
                            style={{ width: `${bar}%`, backgroundColor: '#009D69' }}
                        />
                    </div>
                </div>

                {props.expanded ? (
                    <div className="border-t px-4 py-4">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-muted-foreground text-xs">
                                Média diária: {formatCurrencyBRL(parseApiDecimal(props.categoria.media_diaria))}
                            </p>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => props.onExportCsv(props.categoria.id, props.categoria.nome)}
                                disabled={props.isExportingCsv}
                            >
                                <Download className="mr-2 size-4" />
                                {props.isExportingCsv ? 'Exportando...' : 'Exportar CSV do período'}
                            </Button>
                        </div>
                        <CategoriaGastosDetalhados
                            gastos={props.gastos}
                            isLoading={props.isLoadingGastos}
                            errorMessage={props.errorGastos}
                        />
                    </div>
                ) : null}
            </CardContent>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar categoria</DialogTitle>
                        <DialogDescription>Atualize o nome da categoria.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditOpen(false)}
                            disabled={props.isEditing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={async () => {
                                await props.onEdit(props.categoria.id, nome.trim());
                                setIsEditOpen(false);
                            }}
                            disabled={props.isEditing}
                        >
                            {props.isEditing ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Excluir categoria</DialogTitle>
                        <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={props.isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                await props.onDelete(props.categoria.id);
                                setIsDeleteOpen(false);
                            }}
                            disabled={props.isDeleting}
                        >
                            {props.isDeleting ? 'Excluindo...' : 'Excluir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
