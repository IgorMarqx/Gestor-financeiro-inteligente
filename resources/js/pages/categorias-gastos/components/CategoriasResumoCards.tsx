import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyBRL, parseApiDecimal } from '@/lib/format';

export function CategoriasResumoCards(props: { totalGasto: string; categoriasCount: number }) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Gasto no período
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-2xl font-semibold">
                        {formatCurrencyBRL(parseApiDecimal(props.totalGasto))}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Categorias
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-2xl font-semibold">{props.categoriasCount}</p>
                </CardContent>
            </Card>
        </div>
    );
}

