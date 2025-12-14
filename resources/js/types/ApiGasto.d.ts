export type ApiGasto = {
    id: number;
    nome: string;
    valor: string;
    data: string;
    descricao: string | null;
    metodo_pagamento?: 'DEBITO' | 'CREDITO' | 'PIX' | 'DINHEIRO' | null;
    tipo?: 'FIXO' | 'VARIAVEL' | null;
    necessidade?: 'ESSENCIAL' | 'SUPERFLUO' | null;
    categoria_gasto_id: number;
    origem_id?: number | null;
    origem_tipo?: 'RECORRENTE' | 'PARCELA' | null;
    categoria?: { id: number; nome: string } | null;
};
