export type GastoFormState = {
    nome: string;
    valor: string;
    data: string;
    descricao: string;
    categoria_gasto_id: string;
    metodo_pagamento: string;
    tipo: string;
    necessidade: string;
};

export type GastoSubmitPayload = {
    nome: string;
    valor: number;
    data: string;
    descricao: string | null;
    categoria_gasto_id: number;
    metodo_pagamento?: 'DEBITO' | 'CREDITO' | 'PIX' | 'DINHEIRO' | null;
    tipo?: 'FIXO' | 'VARIAVEL' | null;
    necessidade?: 'ESSENCIAL' | 'SUPERFLUO' | null;
};

