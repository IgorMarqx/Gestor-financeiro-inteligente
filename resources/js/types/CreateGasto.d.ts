export type CreateGastoFormState = {
    nome: string;
    valor: string;
    data: string;
    descricao: string;
    categoria_gasto_id: string;
    metodo_pagamento?: '' | 'DEBITO' | 'CREDITO' | 'PIX' | 'DINHEIRO';
    tipo?: '' | 'FIXO' | 'VARIAVEL';
    necessidade?: '' | 'ESSENCIAL' | 'SUPERFLUO';
};

export type CreateGastoPayload = {
    nome: string;
    valor: number;
    data: string;
    descricao: string | null;
    categoria_gasto_id: number;
    metodo_pagamento?: 'DEBITO' | 'CREDITO' | 'PIX' | 'DINHEIRO' | null;
    tipo?: 'FIXO' | 'VARIAVEL' | null;
    necessidade?: 'ESSENCIAL' | 'SUPERFLUO' | null;
};
