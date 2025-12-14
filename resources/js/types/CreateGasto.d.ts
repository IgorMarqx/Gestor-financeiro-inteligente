export type CreateGastoFormState = {
    nome: string;
    valor: string;
    data: string;
    descricao: string;
    categoria_gasto_id: string;
};

export type CreateGastoPayload = {
    nome: string;
    valor: number;
    data: string;
    descricao: string | null;
    categoria_gasto_id: number;
};

