import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteCategoriaGasto } from '@/hooks/categorias-gastos/useDeleteCategoriaGasto';

export function DeleteCategoriaDialog(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoriaId: number;
    onSuccess?: () => Promise<void> | void;
}) {
    const { deleteCategoria, isSubmitting, errorMessage } = useDeleteCategoriaGasto();

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Excluir categoria</DialogTitle>
                    <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
                </DialogHeader>

                {errorMessage ? (
                    <p className="text-destructive text-sm">{errorMessage}</p>
                ) : null}

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
                        variant="destructive"
                        onClick={async () => {
                            const ok = await deleteCategoria(props.categoriaId);
                            if (!ok) return;
                            props.onOpenChange(false);
                            await props.onSuccess?.();
                        }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

