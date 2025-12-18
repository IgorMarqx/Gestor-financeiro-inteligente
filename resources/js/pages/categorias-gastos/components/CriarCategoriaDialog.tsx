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
import { Plus } from 'lucide-react';

export function CriarCategoriaDialog(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nome: string;
    onNomeChange: (nome: string) => void;
    errorMessage: string | null;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: () => void;
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 size-4" />
                    Criar categoria
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nova categoria</DialogTitle>
                    <DialogDescription>Dê um nome para sua categoria.</DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                        value={props.nome}
                        onChange={(e) => props.onNomeChange(e.target.value)}
                        placeholder="Ex: Alimentação"
                    />
                </div>

                {props.errorMessage ? (
                    <p className="text-destructive text-sm">{props.errorMessage}</p>
                ) : null}

                <DialogFooter>
                    <Button variant="outline" onClick={props.onCancel} disabled={props.isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={props.onSubmit} disabled={props.isSubmitting}>
                        {props.isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

