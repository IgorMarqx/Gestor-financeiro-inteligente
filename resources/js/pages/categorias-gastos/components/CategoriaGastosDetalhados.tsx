import { formatCurrencyBRL, formatDateBR, parseApiDecimal } from '@/lib/format';
import { ApiGastoResumoItem } from '@/types/ApiGastoResumoItem';

export function CategoriaGastosDetalhados(props: {
    gastos: ApiGastoResumoItem[];
    isLoading: boolean;
    errorMessage: string | null;
}) {
    if (props.isLoading) {
        return <p className="text-muted-foreground text-sm">Carregando gastos...</p>;
    }

    if (props.errorMessage) {
        return <p className="text-destructive text-sm">{props.errorMessage}</p>;
    }

    if (props.gastos.length === 0) {
        return <p className="text-muted-foreground text-sm">Nenhum gasto no período.</p>;
    }

    return (
        <div className="space-y-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide">
                GASTOS DETALHADOS
            </p>
            <div className="space-y-2">
                {props.gastos.map((g) => (
                    <div key={g.id} className="bg-muted/40 flex items-center justify-between rounded-lg p-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{g.nome}</p>
                            <p className="text-muted-foreground text-xs">{formatDateBR(g.data)}</p>
                        </div>
                        <p className="text-sm font-semibold">
                            {formatCurrencyBRL(parseApiDecimal(g.valor))}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

