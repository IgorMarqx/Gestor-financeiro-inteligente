import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { useDestroyFamilias } from '@/hooks/familias/useDestroyFamilias';

type Props = {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onDeleted: () => void;
};

export default function FamilyDeleteDialog({ isDialogOpen, setIsDialogOpen, onDeleted }: Props) {
    const { isSubmitting, handleDeleteFamilia } = useDestroyFamilias();

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir familia</DialogTitle>
                    <DialogDescription>
                        Esta acao remove o vinculo de todos os membros. Os dados existentes permanecem com o ultimo
                        vinculo registrado.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={async () => {
                            const ok = await handleDeleteFamilia();
                            if (ok) {
                                setIsDialogOpen(false);
                                onDeleted();
                            }
                        }}
                        disabled={isSubmitting}
                    >
                        Confirmar exclusao
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
