export type ApiGasto = {
    id: number;
    nome: string;
    valor: string;
    data: string;
    descricao: string | null;
    categoria_gasto_id: number;
    categoria?: { id: number; nome: string } | null;
};