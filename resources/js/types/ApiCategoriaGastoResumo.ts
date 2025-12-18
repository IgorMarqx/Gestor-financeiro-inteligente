export type ApiCategoriaGastoResumo = {
    id: number;
    nome: string;
    gasto_total: string;
    gastos_count: number;
    ultima_data: string | null;
    participacao_percentual: number;
    media_por_gasto: string;
    maior_gasto: string;
    media_diaria: string;
    serie_30d: string[];
    orcamento_limite: string | null;
    orcamento_saldo: string | null;
    orcamento_percentual: number | null;
    status: 'sem_orcamento' | 'ok' | 'alerta80' | 'estourou';
};

export type ApiCategoriasGastosResumoResponse = {
    periodo: { inicio: string; fim: string; mes: string | null };
    totais: { gasto_total: string; categorias: number };
    categorias: ApiCategoriaGastoResumo[];
};
