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
import { AsyncSearchSelect } from '@/components/inputs/async-search-select';
import { useCreateCategoriaGasto } from '@/hooks/categorias-gastos/useCreateCategoriaGasto';
import { useGetCategoriasGastos } from '@/hooks/categorias-gastos/useGetCategoriasGastos';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export function CategoriaGastoField({ value, onChange }: Props) {
    const { loadCategorias } = useGetCategoriasGastos();
    const {
        createCategoria,
        isSubmitting: isCreating,
        errorMessage: createError,
    } = useCreateCategoriaGasto();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [categoriaNome, setCategoriaNome] = useState('');

    const loadOptions = useCallback(
        async (query: string) => {
            const data = await loadCategorias(query);
            return data.map((c) => ({ value: String(c.id), label: c.nome }));
        },
        [loadCategorias],
    );

    const onCreate = async () => {
        const nome = categoriaNome.trim();
        if (!nome) return;

        const created = await createCategoria({ nome });
        if (!created) return;

        setIsCreateOpen(false);
        setCategoriaNome('');
        onChange(String(created.id));
    };

    return (
        <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <AsyncSearchSelect
                    label="Categorias"
                    placeholder="Selecione uma categoria"
                    value={value ? value : null}
                    onChange={(v) => onChange(v ?? '')}
                    loadOptions={loadOptions}
                    emptyMessage="Nenhuma categoria encontrada."
                />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="h-9 px-3">
                        <Plus className="mr-2 size-4" />
                        Nova
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Nova categoria</DialogTitle>
                        <DialogDescription>
                            Crie uma categoria para organizar seus gastos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input
                            value={categoriaNome}
                            onChange={(e) => setCategoriaNome(e.target.value)}
                            placeholder="Ex: Alimentação"
                        />
                    </div>
                    {createError ? <p className="text-destructive text-sm">{createError}</p> : null}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                            disabled={isCreating}
                        >
                            Cancelar
                        </Button>
                        <Button type="button" onClick={onCreate} disabled={isCreating}>
                            {isCreating ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
