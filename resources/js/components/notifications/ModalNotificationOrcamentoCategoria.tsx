import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrencyBRL, monthToLabel } from '@/lib/format';

type OrcamentoBatchPayload = {
    categoria_nome: string;
    meses: string[];
    limite: number;
};

type ModalNotificationOrcamentoCategoriaProps = {
    open: boolean;
    payload: OrcamentoBatchPayload | null;
    onOpenChange: (open: boolean) => void;
};

function getMesIntervalo(meses: string[]): { inicio: string; fim: string } | null {
    if (!meses?.length) return null;
    const ordenados = [...meses].sort();
    return { inicio: ordenados[0], fim: ordenados[ordenados.length - 1] };
}

export function ModalNotificationOrcamentoCategoria({
    open,
    payload,
    onOpenChange,
}: ModalNotificationOrcamentoCategoriaProps) {
    const intervalo = payload ? getMesIntervalo(payload.meses) : null;
    const limite = payload ? formatCurrencyBRL(payload.limite) : '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Orçamentos atualizados</DialogTitle>
                </DialogHeader>
                {payload ? (
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <p className="text-foreground">
                            Processamento concluído para categoria:{' '}
                            <span className="font-medium">{payload.categoria_nome}</span>.
                        </p>
                        {intervalo ? (
                            <p>
                                Do mês <span className="font-medium text-foreground">{monthToLabel(intervalo.inicio)}</span>{' '}
                                ao mês <span className="font-medium text-foreground">{monthToLabel(intervalo.fim)}</span>{' '}
                                foi adicionado um orçamento de{' '}
                                <span className="font-medium text-foreground">{limite}</span>.
                            </p>
                        ) : (
                            <p>
                                Foi adicionado um orçamento de{' '}
                                <span className="font-medium text-foreground">{limite}</span>.
                            </p>
                        )}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
