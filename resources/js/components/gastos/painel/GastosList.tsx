import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiGasto } from '@/types/ApiGasto';
import { GastoCard } from './GastoCard';

type Props = {
    gastos: ApiGasto[];
    isLoading: boolean;
    errorMessage: string | null;
    onEdit: (gasto: ApiGasto) => void;
    onDelete: (id: number) => void;
};

export function GastosList({ gastos, isLoading, errorMessage, onEdit, onDelete }: Props) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Carregando...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (errorMessage) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Erro</CardTitle>
                </CardHeader>
                <CardContent className="text-destructive text-sm">{errorMessage}</CardContent>
            </Card>
        );
    }

    if (gastos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Nenhum gasto</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                    Ajuste os filtros ou crie um novo gasto.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gastos.map((g) => (
                <GastoCard key={g.id} gasto={g} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
}

