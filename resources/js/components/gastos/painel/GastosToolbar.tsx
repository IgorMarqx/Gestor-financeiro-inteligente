import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ParcelamentosModal } from '@/components/gastos/parcelamentos/ParcelamentosModal';

type Props = {
    onCreateClick: () => void;
};

export function GastosToolbar({ onCreateClick }: Props) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <ParcelamentosModal />
                <Button type="button" onClick={onCreateClick} className="sm:w-auto">
                    <Plus className="size-4" />
                    Novo gasto
                </Button>
            </div>
        </div>
    );
}
