import { GastoParcelamentoForm } from '@/components/gastos/parcelamentos/GastoParcelamentoForm';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export function ParcelamentosModal() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline">
                    Parcelamentos
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Parcelamentos</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 overflow-y-auto max-h-[90vh] pb-4">
                    <div>
                        <p className="text-sm font-semibold">Novo parcelamento</p>
                        <p className="text-muted-foreground mb-3 text-xs">
                            Ao criar, as parcelas são geradas automaticamente.
                        </p>
                        <GastoParcelamentoForm
                            onCreated={() => {
                                setOpen(false);
                            }}
                        />
                    </div>
                    <Separator />
                </div>
            </DialogContent>
        </Dialog>
    );
}
