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
import { Label } from '@/components/ui/label';
import { useUpdateCategoriaGasto } from '@/hooks/categorias-gastos/useUpdateCategoriaGasto';
import { useEffect, useState } from 'react';

export function EditCategoriaDialog(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoriaId: number;
    nomeInicial: string;
    onSuccess?: () => Promise<void> | void;
}) {
    const { updateCategoria, isSubmitting, errorMessage } = useUpdateCategoriaGasto();
    const [nome, setNome] = useState(props.nomeInicial);

    useEffect(() => {
        if (!props.open) return;
        setNome(props.nomeInicial);
    }, [props.open, props.nomeInicial]);

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Editar categoria</DialogTitle>
                    <DialogDescription>Atualize o nome da categoria.</DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={nome} onChange={(e) => setNome(e.target.value)} />
                    {errorMessage ? (
                        <p className="text-destructive text-sm">{errorMessage}</p>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => props.onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={async () => {
                            const trimmed = nome.trim();
                            if (!trimmed) return;
                            const ok = await updateCategoria(props.categoriaId, { nome: trimmed });
                            if (!ok) return;
                            props.onOpenChange(false);
                            await props.onSuccess?.();
                        }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

