import { AlertToast } from '@/components/gastos/painel/AlertToast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InputMask } from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGastoValidacao } from '@/hooks/gastos/useGastoValidacao';
import { ApiGasto } from '@/types/ApiGasto';
import { useEffect, useMemo, useState } from 'react';
import { type GastoFormState, type GastoSubmitPayload } from './gasto-form-types';
import { CategoriaGastoField } from '@/components/categorias-gastos/categoria-gasto-field';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gasto?: ApiGasto | null;
    isSubmitting: boolean;
    errorMessage: string | null;
    onSubmit: (payload: GastoSubmitPayload) => Promise<boolean>;
};

function toFormState(gasto?: ApiGasto | null): GastoFormState {
    return {
        nome: gasto?.nome ?? '',
        valor: gasto?.valor ?? '',
        data: gasto?.data ?? new Date().toISOString().slice(0, 10),
        descricao: gasto?.descricao ?? '',
        categoria_gasto_id: gasto?.categoria_gasto_id ? String(gasto.categoria_gasto_id) : '',
        metodo_pagamento: gasto?.metodo_pagamento ?? '',
        tipo: gasto?.tipo ?? '',
        necessidade: gasto?.necessidade ?? '',
    };
}

export function GastoFormModal({
    open,
    onOpenChange,
    gasto,
    isSubmitting,
    errorMessage,
    onSubmit,
}: Props) {
    const isEdit = !!gasto;
    const [state, setState] = useState<GastoFormState>(toFormState(gasto));
    const { validar, isLoading: isValidating } = useGastoValidacao();
    const [validationWarning, setValidationWarning] = useState<string | null>(null);
    const [mustConfirm, setMustConfirm] = useState(false);

    useEffect(() => {
        if (!open) return;
        queueMicrotask(() => {
            setState(toFormState(gasto));
            setValidationWarning(null);
            setMustConfirm(false);
        });
    }, [open, gasto]);

    const payload = useMemo<GastoSubmitPayload | null>(() => {
        const valor = Number(state.valor.replace(',', '.'));
        const categoria = Number(state.categoria_gasto_id);
        if (!state.nome || !state.data || !categoria || Number.isNaN(valor)) return null;
        return {
            nome: state.nome,
            valor,
            data: state.data,
            descricao: state.descricao.trim() ? state.descricao.trim() : null,
            categoria_gasto_id: categoria,
            metodo_pagamento: state.metodo_pagamento
                ? (state.metodo_pagamento as GastoSubmitPayload['metodo_pagamento'])
                : null,
            tipo: state.tipo ? (state.tipo as GastoSubmitPayload['tipo']) : null,
            necessidade: state.necessidade
                ? (state.necessidade as GastoSubmitPayload['necessidade'])
                : null,
        };
    }, [state]);

    const handleSubmit = async () => {
        if (!payload) return;

        if (!mustConfirm) {
            const validation = await validar({
                nome: payload.nome,
                valor: payload.valor,
                data: payload.data,
                categoria_gasto_id: payload.categoria_gasto_id,
            });
            if (validation) {
                const hasDup = (validation.possivel_duplicado ?? []).length > 0;
                if (hasDup || validation.suspeito) {
                    setMustConfirm(true);
                    const reason = validation.suspeito
                        ? validation.motivo_texto ?? 'Valor suspeito para a categoria.'
                        : 'Possível duplicidade detectada.';
                    setValidationWarning(reason);
                    return;
                }
            }
        }

        const ok = await onSubmit(payload);
        if (ok) onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar gasto' : 'Novo gasto'}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Nome</Label>
                        <Input
                            value={state.nome}
                            onChange={(e) => setState((s) => ({ ...s, nome: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Valor</Label>
                        <InputMask
                            mask="money"
                            value={state.valor}
                            onValueChange={(next) =>
                                setState((s) => ({ ...s, valor: next.value }))
                            }
                            placeholder="Ex: 120,50"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Data</Label>
                        <Input
                            type="date"
                            value={state.data}
                            onChange={(e) => setState((s) => ({ ...s, data: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <CategoriaGastoField
                            value={state.categoria_gasto_id}
                            onChange={(categoria_gasto_id) =>
                                setState((s) => ({ ...s, categoria_gasto_id }))
                            }
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Método</Label>
                        <Select
                            value={state.metodo_pagamento || 'none'}
                            onValueChange={(v) =>
                                setState((s) => ({
                                    ...s,
                                    metodo_pagamento: v === 'none' ? '' : v,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="(opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">(opcional)</SelectItem>
                                <SelectItem value="DEBITO">DEBITO</SelectItem>
                                <SelectItem value="CREDITO">CREDITO</SelectItem>
                                <SelectItem value="PIX">PIX</SelectItem>
                                <SelectItem value="DINHEIRO">DINHEIRO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Tipo</Label>
                        <Select
                            value={state.tipo || 'none'}
                            onValueChange={(v) =>
                                setState((s) => ({ ...s, tipo: v === 'none' ? '' : v }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="(opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">(opcional)</SelectItem>
                                <SelectItem value="FIXO">FIXO</SelectItem>
                                <SelectItem value="VARIAVEL">VARIAVEL</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Necessidade</Label>
                        <Select
                            value={state.necessidade || 'none'}
                            onValueChange={(v) =>
                                setState((s) => ({
                                    ...s,
                                    necessidade: v === 'none' ? '' : v,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="(opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">(opcional)</SelectItem>
                                <SelectItem value="ESSENCIAL">ESSENCIAL</SelectItem>
                                <SelectItem value="SUPERFLUO">SUPERFLUO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                        <Label>Descrição</Label>
                        <Input
                            value={state.descricao}
                            onChange={(e) =>
                                setState((s) => ({ ...s, descricao: e.target.value }))
                            }
                        />
                    </div>
                </div>

                {validationWarning ? (
                    <div className="pt-2">
                        <AlertToast
                            title="Atenção antes de salvar"
                            description={`${validationWarning} Confirme para salvar mesmo assim.`}
                        />
                    </div>
                ) : null}

                {errorMessage ? (
                    <p className="text-destructive pt-2 text-sm">{errorMessage}</p>
                ) : null}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting || isValidating}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={!payload || isSubmitting || isValidating}
                    >
                        {isValidating
                            ? 'Validando...'
                            : isSubmitting
                                ? 'Salvando...'
                                : mustConfirm
                                    ? 'Confirmar e salvar'
                                    : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
