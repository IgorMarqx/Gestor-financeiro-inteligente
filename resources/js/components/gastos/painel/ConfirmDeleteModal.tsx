import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isDeleting: boolean;
    errorMessage: string | null;
    onConfirm: () => void;
};

export function ConfirmDeleteModal({
    open,
    onOpenChange,
    isDeleting,
    errorMessage,
    onConfirm,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Deletar gasto</DialogTitle>
                    <DialogDescription>Essa ação remove o lançamento do painel.</DialogDescription>
                </DialogHeader>
                {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" disabled={isDeleting} onClick={onConfirm}>
                        {isDeleting ? 'Deletando...' : 'Deletar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

