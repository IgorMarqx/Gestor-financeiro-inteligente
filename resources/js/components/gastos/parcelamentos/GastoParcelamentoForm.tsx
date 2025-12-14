import { CategoriaGastoField } from '@/components/categorias-gastos/categoria-gasto-field';
import { AlertToast } from '@/components/gastos/painel/AlertToast';
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
import { useCreateGastoParcelamento } from '@/hooks/gastos-parcelamentos/useCreateGastoParcelamento';
import { useGerarParcelas } from '@/hooks/gastos-parcelamentos/useGerarParcelas';
import { useState } from 'react';

type Props = {
    onCreated: () => void;
};

type State = {
    nome: string;
    descricao: string;
    valor_total: string;
    parcelas_total: string;
    data_inicio: string;
    categoria_gasto_id: string;
    metodo_pagamento: string;
    tipo: string;
    necessidade: string;
};

export function GastoParcelamentoForm({ onCreated }: Props) {
    const { create, isSubmitting, errorMessage } = useCreateGastoParcelamento();
    const { gerarParcelas, isSubmitting: isGerandoParcelas } = useGerarParcelas();
    const [state, setState] = useState<State>({
        nome: '',
        descricao: '',
        valor_total: '',
        parcelas_total: '12',
        data_inicio: new Date().toISOString().slice(0, 10),
        categoria_gasto_id: '',
        metodo_pagamento: 'CREDITO',
        tipo: '',
        necessidade: '',
    });

    const submit = async () => {
        const valor = Number(state.valor_total.replace(',', '.'));
        const parcelas = Number(state.parcelas_total);
        const categoriaId = Number(state.categoria_gasto_id);
        if (!state.nome || !state.data_inicio || !categoriaId) return;
        if (Number.isNaN(valor) || Number.isNaN(parcelas)) return;

        const created = await create({
            nome: state.nome,
            descricao: state.descricao.trim() ? state.descricao.trim() : null,
            valor_total: valor,
            parcelas_total: parcelas,
            data_inicio: state.data_inicio,
            categoria_gasto_id: categoriaId,
            metodo_pagamento: state.metodo_pagamento
                ? (state.metodo_pagamento as 'DEBITO' | 'CREDITO' | 'PIX' | 'DINHEIRO')
                : null,
            tipo: state.tipo ? (state.tipo as 'FIXO' | 'VARIAVEL') : null,
            necessidade: state.necessidade
                ? (state.necessidade as 'ESSENCIAL' | 'SUPERFLUO')
                : null,
        });

        if (!created) return;

        await gerarParcelas(created.id);

        setState((s) => ({
            ...s,
            nome: '',
            descricao: '',
            valor_total: '',
        }));
        onCreated();
    };

    const canSubmit =
        state.nome.trim() !== '' &&
        state.categoria_gasto_id !== '' &&
        state.data_inicio !== '' &&
        state.valor_total !== '' &&
        Number(state.parcelas_total) > 0;

    return (
        <div className="space-y-4 px-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-3">
                    <Label>Nome</Label>
                    <Input
                        value={state.nome}
                        onChange={(e) => setState((s) => ({ ...s, nome: e.target.value }))}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Valor total</Label>
                    <Input
                        inputMode="decimal"
                        value={state.valor_total}
                        onChange={(e) =>
                            setState((s) => ({ ...s, valor_total: e.target.value }))
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label>Parcelas</Label>
                    <Input
                        inputMode="numeric"
                        value={state.parcelas_total}
                        onChange={(e) =>
                            setState((s) => ({ ...s, parcelas_total: e.target.value }))
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label>Data início</Label>
                    <Input
                        type="date"
                        value={state.data_inicio}
                        onChange={(e) =>
                            setState((s) => ({ ...s, data_inicio: e.target.value }))
                        }
                    />
                </div>
                <div className="space-y-1 sm:col-span-3">
                    <CategoriaGastoField
                        value={state.categoria_gasto_id}
                        onChange={(v) => setState((s) => ({ ...s, categoria_gasto_id: v }))}
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
                <div className="space-y-1">
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

                <div className="space-y-1 sm:col-span-3">
                    <Label>Descrição</Label>
                    <Input
                        value={state.descricao}
                        onChange={(e) =>
                            setState((s) => ({ ...s, descricao: e.target.value }))
                        }
                    />
                </div>
            </div>

            {errorMessage ? (
                <AlertToast title="Erro" description={errorMessage} />
            ) : null}

            <div className="flex justify-end">
                <Button
                    type="button"
                    onClick={() => void submit()}
                    disabled={!canSubmit || isSubmitting || isGerandoParcelas}
                >
                    {isSubmitting || isGerandoParcelas ? 'Salvando...' : 'Criar parcelamento'}
                </Button>
            </div>
        </div>
    );
}
