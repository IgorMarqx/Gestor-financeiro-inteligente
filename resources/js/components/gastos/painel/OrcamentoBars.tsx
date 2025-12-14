import { OrcamentoResumoItem } from '@/hooks/orcamentos/useOrcamentos';

type Props = {
    itens: OrcamentoResumoItem[];
};

export function OrcamentoBars({ itens }: Props) {
    if (itens.length === 0) return null;

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="mb-3">
                <h2 className="text-sm font-semibold">Orçamento por categoria</h2>
                <p className="text-muted-foreground text-xs">
                    Visual (80%/100%) com base no mês selecionado.
                </p>
            </div>
            <div className="space-y-3">
                {itens.map((item) => {
                    const pct = Math.max(0, Math.min(100, item.percentual));
                    const barClass =
                        item.status === 'estourou'
                            ? 'bg-destructive'
                            : item.status === 'alerta80'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500';
                    return (
                        <div key={item.categoria_gasto_id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{item.categoria_nome}</span>
                                <span className="text-muted-foreground">
                                    {pct.toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                    className={`h-2 rounded-full ${barClass}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="text-muted-foreground flex items-center justify-between text-xs">
                                <span>Gasto: R$ {Number(item.gasto_atual).toFixed(2).replace('.', ',')}</span>
                                <span>Limite: R$ {Number(item.limite).toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

