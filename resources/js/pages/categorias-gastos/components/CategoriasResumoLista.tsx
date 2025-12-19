import { ApiCategoriaGastoResumo } from '@/types/ApiCategoriaGastoResumo';
import { ApiGastoResumoItem } from '@/types/ApiGastoResumoItem';
import { CategoriaResumoCard } from '@/pages/categorias-gastos/components/CategoriaResumoCard';

export function CategoriasResumoLista(props: {
    categorias: ApiCategoriaGastoResumo[];
    maxGasto: number;
    mes: string;
    expandedId: number | null;
    onToggleExpand: (categoriaId: number) => void;
    gastosByCategoria: Record<number, ApiGastoResumoItem[]>;
    isLoadingByCategoria: Record<number, boolean>;
    errorByCategoria: Record<number, string | null>;
    onResumoChange: () => Promise<void> | void;
}) {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {props.categorias.map((categoria) => {
                const expanded = props.expandedId === categoria.id;
                return (
                    <CategoriaResumoCard
                        key={categoria.id}
                        categoria={categoria}
                        mes={props.mes}
                        expanded={expanded}
                        onToggle={() => props.onToggleExpand(categoria.id)}
                        gastos={props.gastosByCategoria[categoria.id] ?? []}
                        isLoadingGastos={props.isLoadingByCategoria[categoria.id] ?? false}
                        errorGastos={props.errorByCategoria[categoria.id] ?? null}
                        maxGasto={props.maxGasto}
                        onResumoChange={props.onResumoChange}
                    />
                );
            })}
        </div>
    );
}
