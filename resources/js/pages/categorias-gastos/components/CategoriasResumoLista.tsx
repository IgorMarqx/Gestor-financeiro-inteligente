import { ApiCategoriaGastoResumo } from '@/types/ApiCategoriaGastoResumo';
import { ApiGastoResumoItem } from '@/types/ApiGastoResumoItem';
import { CategoriaResumoCard } from '@/pages/categorias-gastos/components/CategoriaResumoCard';

export function CategoriasResumoLista(props: {
    categorias: ApiCategoriaGastoResumo[];
    maxGasto: number;
    expandedId: number | null;
    onToggleExpand: (categoriaId: number) => void;
    gastosByCategoria: Record<number, ApiGastoResumoItem[]>;
    isLoadingByCategoria: Record<number, boolean>;
    errorByCategoria: Record<number, string | null>;
    onEdit: (id: number, nome: string) => Promise<void> | void;
    onDelete: (id: number) => Promise<void> | void;
    onExportCsv: (id: number, categoriaNome?: string) => Promise<void> | void;
    isEditing?: boolean;
    isDeleting?: boolean;
    isExportingCsv?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {props.categorias.map((categoria) => {
                const expanded = props.expandedId === categoria.id;
                return (
                    <CategoriaResumoCard
                        key={categoria.id}
                        categoria={categoria}
                        expanded={expanded}
                        onToggle={() => props.onToggleExpand(categoria.id)}
                        gastos={props.gastosByCategoria[categoria.id] ?? []}
                        isLoadingGastos={props.isLoadingByCategoria[categoria.id] ?? false}
                        errorGastos={props.errorByCategoria[categoria.id] ?? null}
                        maxGasto={props.maxGasto}
                        onEdit={props.onEdit}
                        onDelete={props.onDelete}
                        onExportCsv={props.onExportCsv}
                        isEditing={props.isEditing}
                        isDeleting={props.isDeleting}
                        isExportingCsv={props.isExportingCsv}
                    />
                );
            })}
        </div>
    );
}
