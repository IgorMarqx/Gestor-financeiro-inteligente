import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { InputMask } from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { useEffect, useMemo, useState } from 'react';
import { useDeleteOrcamentoCategoria } from '@/hooks/orcamentos-categorias/useDeleteOrcamentoCategoria';
import { useBatchUpsertOrcamentoCategoria } from '@/hooks/orcamentos-categorias/useBatchUpsertOrcamentoCategoria';
import { moneyToRaw, rawToMaskedMoney, rawToMoney } from '@/pages/categorias-gastos/components/orcamento-categoria-utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export function OrcamentoCategoriaDialog(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoriaId: number;
    mes: string; // YYYY-MM
    limiteInicial: number | null;
    onSuccess?: () => Promise<void> | void;
}) {
    const initialRaw = useMemo(() => {
        if (props.limiteInicial === null) return '';
        return moneyToRaw(props.limiteInicial);
    }, [props.limiteInicial]);

    const [masked, setMasked] = useState('');
    const [raw, setRaw] = useState('');
    const [applyOtherMonths, setApplyOtherMonths] = useState(false);
    const [rangeStart, setRangeStart] = useState<string>('');
    const [rangeEnd, setRangeEnd] = useState<string>('');
    const [batchError, setBatchError] = useState<string | null>(null);
    const {
        batchUpsertOrcamento,
        isSubmitting: isSubmittingBatch,
        errorMessage: batchUpsertErrorMessage,
    } = useBatchUpsertOrcamentoCategoria();
    const {
        deleteOrcamento,
        isSubmitting: isSubmittingDelete,
        errorMessage: deleteErrorMessage,
    } = useDeleteOrcamentoCategoria();

    const errorMessage = batchError ?? batchUpsertErrorMessage ?? deleteErrorMessage ?? null;

    useEffect(() => {
        if (!props.open) return;
        setRaw(initialRaw);
        setMasked(rawToMaskedMoney(initialRaw));
        setApplyOtherMonths(false);
        setRangeStart(props.mes);
        setRangeEnd(props.mes);
        setBatchError(null);
    }, [props.open, initialRaw, props.mes]);

    const disabled = isSubmittingBatch || isSubmittingDelete;
    const canSave = raw !== '' && !disabled;

    const monthsToApply = useMemo(() => {
        const base = [props.mes];

        if (!applyOtherMonths) return base;
        if (!rangeStart || !rangeEnd) return base;

        const ranged = listMonthsBetween(rangeStart, rangeEnd);
        return Array.from(new Set([...base, ...ranged]));
    }, [applyOtherMonths, props.mes, rangeEnd, rangeStart]);

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Orçamento da categoria</DialogTitle>
                    <DialogDescription>Defina o limite mensal para {props.mes}.</DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label>Limite</Label>
                    <InputMask
                        mask="money"
                        placeholder="0,00"
                        value={masked}
                        onValueChange={(next) => {
                            setMasked(next.value);
                            setRaw(next.raw);
                        }}
                    />
                    {errorMessage ? (
                        <p className="text-destructive text-sm">{errorMessage}</p>
                    ) : (
                        <p className="text-muted-foreground text-xs">Formato: 1.234,56</p>
                    )}
                </div>

                <div className="space-y-3 rounded-md border p-3">
                    <div className="flex items-start gap-2">
                        <Checkbox
                            checked={applyOtherMonths}
                            onCheckedChange={(checked) => {
                                const next = Boolean(checked);
                                setApplyOtherMonths(next);
                                setBatchError(null);
                                if (!next) {
                                    setRangeStart(props.mes);
                                    setRangeEnd(props.mes);
                                }
                            }}
                            disabled={disabled}
                        />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Aplicar em outros meses</p>
                            <p className="text-muted-foreground text-xs">
                                O mês atual ({props.mes}) sempre será aplicado.
                            </p>
                        </div>
                    </div>

                    {applyOtherMonths ? (
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <Label>Período</Label>
                                <p className="text-muted-foreground text-xs">
                                    Selecione o intervalo (início e fim). Vamos aplicar em todos os meses desse período.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label>De</Label>
                                    <Input
                                        type="month"
                                        value={rangeStart}
                                        onChange={(e) => {
                                            setRangeStart(e.target.value);
                                            setBatchError(null);
                                        }}
                                        disabled={disabled}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Até</Label>
                                    <Input
                                        type="month"
                                        value={rangeEnd}
                                        onChange={(e) => {
                                            setRangeEnd(e.target.value);
                                            setBatchError(null);
                                        }}
                                        disabled={disabled}
                                    />
                                </div>
                            </div>

                            <p className="text-muted-foreground text-xs">
                                Total selecionado: {monthsToApply.length} mês(es)
                            </p>
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {props.limiteInicial !== null ? (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={async () => {
                                const ok = await deleteOrcamento({
                                    categoria_gasto_id: props.categoriaId,
                                    mes: props.mes,
                                });
                                if (!ok) return;
                                props.onOpenChange(false);
                                await props.onSuccess?.();
                            }}
                            disabled={disabled}
                        >
                            Remover
                        </Button>
                    ) : null}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => props.onOpenChange(false)}
                        disabled={disabled}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={async () => {
                            setBatchError(null);
                            const limite = rawToMoney(raw);

                            if (applyOtherMonths && rangeStart && rangeEnd) {
                                if (compareMonth(rangeStart, rangeEnd) > 0) {
                                    setBatchError('O mês inicial não pode ser maior que o mês final.');
                                    return;
                                }
                            }

                            const ok = await batchUpsertOrcamento({
                                categoria_gasto_id: props.categoriaId,
                                meses: monthsToApply,
                                limite,
                            });
                            if (!ok) return;

                            props.onOpenChange(false);
                            await props.onSuccess?.();
                        }}
                        disabled={!canSave}
                    >
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function compareMonth(a: string, b: string): number {
    return a.localeCompare(b);
}

function addMonths(yyyyMm: string, amount: number): string {
    const [y, m] = yyyyMm.split('-').map(Number);
    if (!y || !m) return '';
    const date = new Date(y, m - 1, 1);
    date.setMonth(date.getMonth() + amount);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
}

function listMonthsBetween(start: string, end: string): string[] {
    if (!start || !end) return [];
    if (compareMonth(start, end) > 0) return [];

    const months: string[] = [];
    let current = start;
    let guard = 0;
    while (compareMonth(current, end) <= 0) {
        months.push(current);
        current = addMonths(current, 1);
        guard += 1;
        if (guard > 240) break;
    }
    return months;
}
