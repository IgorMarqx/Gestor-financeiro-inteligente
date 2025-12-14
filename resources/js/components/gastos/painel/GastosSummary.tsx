type Props = {
    totalPeriodo: string;
    inicio: string;
    fim: string;
    count: number;
};

export function GastosSummary({ totalPeriodo, inicio, fim, count }: Props) {
    const total = Number(totalPeriodo ?? 0);
    return (
        <div className="rounded-xl border bg-gradient-to-r from-emerald-50 to-white p-4 dark:from-emerald-950/40 dark:to-background">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-muted-foreground text-sm">Período</p>
                    <p className="text-sm font-medium">
                        {inicio} → {fim}
                    </p>
                    <p className="text-muted-foreground text-xs">{count} itens no período</p>
                </div>
                <div className="text-right">
                    <p className="text-muted-foreground text-sm">Total do período</p>
                    <p className="text-2xl font-semibold tracking-tight">
                        R$ {total.toFixed(2).replace('.', ',')}
                    </p>
                </div>
            </div>
        </div>
    );
}
