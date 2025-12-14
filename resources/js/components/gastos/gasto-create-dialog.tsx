import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InputMask } from '@/components/ui/input-mask';
import { CategoriaGastoField } from '@/components/categorias-gastos/categoria-gasto-field';
import { type CreateGastoFormState, type CreateGastoPayload } from '@/types/CreateGasto';
import { DollarSign } from 'lucide-react';
import { useState } from 'react';

type Props = {
    onCreate: (payload: CreateGastoPayload) => Promise<unknown | null>;
    onCreated?: () => void;
    isSubmitting: boolean;
    errorMessage: string | null;
    triggerLabel?: string;
    triggerClassName?: string;
};

const initialFormState: CreateGastoFormState = {
    nome: '',
    valor: '',
    data: '',
    descricao: '',
    categoria_gasto_id: '',
};

export function GastoCreateDialog({
    onCreate,
    onCreated,
    isSubmitting,
    errorMessage,
    triggerLabel = 'Criar gasto',
    triggerClassName = 'w-full sm:w-auto cursor-pointer',
}: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState<CreateGastoFormState>(initialFormState);

    const parseMoney = (masked: string): number => {
        const normalized = masked.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
        const value = Number(normalized);
        return Number.isFinite(value) ? value : 0;
    };

    const onSubmit = async () => {
        const payload: CreateGastoPayload = {
            nome: form.nome,
            valor: parseMoney(form.valor),
            data: form.data,
            descricao: form.descricao ? form.descricao : null,
            categoria_gasto_id: Number(form.categoria_gasto_id),
        };

        const created = await onCreate(payload);
        if (!created) return;

        setIsDialogOpen(false);
        setForm(initialFormState);
        onCreated?.();
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className={triggerClassName}>
                    <DollarSign className="size-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Novo gasto</DialogTitle>
                    <DialogDescription>Preencha as informações do gasto.</DialogDescription>
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
                            onValueChange={(next) =>
                                setForm((s) => ({ ...s, valor: next.value }))
                            }
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
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={onSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
