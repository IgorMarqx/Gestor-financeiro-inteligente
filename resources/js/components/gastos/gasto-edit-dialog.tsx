import { CategoriaGastoField } from '@/components/categorias-gastos/categoria-gasto-field';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InputMask } from '@/components/ui/input-mask';
import { ApiGasto } from '@/types/ApiGasto';
import { useEffect, useMemo, useState } from 'react';

type FormState = {
    nome: string;
    valor: string;
    data: string;
    descricao: string;
    categoria_gasto_id: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gasto: ApiGasto | null;
    isSubmitting: boolean;
    errorMessage: string | null;
    onSubmit: (payload: {
        nome: string;
        valor: number;
        data: string;
        descricao: string | null;
        categoria_gasto_id: number;
    }) => Promise<boolean>;
};

const toMoneyMasked = (value: string): string => {
    const digits = String(value ?? '').replace(/\D+/g, '');
    const cents = digits.padStart(3, '0');
    const intPart = cents.slice(0, -2).replace(/^0+(?=\d)/, '');
    const fracPart = cents.slice(-2);
    const withThousands = (intPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withThousands},${fracPart}`;
};

const parseMoney = (masked: string): number => {
    const normalized = masked.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const value = Number(normalized);
    return Number.isFinite(value) ? value : 0;
};

export function GastoEditDialog({
    open,
    onOpenChange,
    gasto,
    isSubmitting,
    errorMessage,
    onSubmit,
}: Props) {
    const initialForm = useMemo<FormState>(() => {
        if (!gasto) {
            return { nome: '', valor: '', data: '', descricao: '', categoria_gasto_id: '' };
        }

        const valorDigits = String(gasto.valor ?? '').replace(/\D+/g, '');
        return {
            nome: gasto.nome ?? '',
            valor: valorDigits ? toMoneyMasked(valorDigits) : '',
            data: gasto.data ?? '',
            descricao: gasto.descricao ?? '',
            categoria_gasto_id: String(gasto.categoria_gasto_id ?? ''),
        };
    }, [gasto]);

    const [form, setForm] = useState<FormState>(initialForm);

    useEffect(() => {
        setForm(initialForm);
    }, [initialForm]);

    const submit = async () => {
        if (!gasto) return;

        const ok = await onSubmit({
            nome: form.nome,
            valor: parseMoney(form.valor),
            data: form.data,
            descricao: form.descricao ? form.descricao : null,
            categoria_gasto_id: Number(form.categoria_gasto_id),
        });

        if (ok) onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Editar gasto</DialogTitle>
                    <DialogDescription>Atualize as informações do gasto.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input
                            value={form.nome}
                            onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
                            placeholder="Ex: Mercado"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Valor</label>
                        <InputMask
                            mask="money"
                            value={form.valor}
                            onValueChange={(next) => setForm((s) => ({ ...s, valor: next.value }))}
                            placeholder="Ex: 120,50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Data</label>
                        <Input
                            type="date"
                            value={form.data}
                            onChange={(e) => setForm((s) => ({ ...s, data: e.target.value }))}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <CategoriaGastoField
                            value={form.categoria_gasto_id}
                            onChange={(categoria_gasto_id) =>
                                setForm((s) => ({ ...s, categoria_gasto_id }))
                            }
                        />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium">Descrição</label>
                        <Input
                            value={form.descricao}
                            onChange={(e) =>
                                setForm((s) => ({ ...s, descricao: e.target.value }))
                            }
                            placeholder="Opcional"
                        />
                    </div>
                </div>

                {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button type="button" onClick={submit} disabled={isSubmitting || !gasto}>
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

