export type ApiGastoParcelamento = {
    id: number;
    usuario_id?: number;
    categoria_gasto_id: number;
    nome: string;
    descricao: string | null;
    valor_total: string;
    parcelas_total: number;
    data_inicio: string;
    ativo: boolean;
    metodo_pagamento?: 'DEBITO' | 'CREDITO' | 'PIX' | 'DINHEIRO' | null;
    tipo?: 'FIXO' | 'VARIAVEL' | null;
    necessidade?: 'ESSENCIAL' | 'SUPERFLUO' | null;
    categoria?: { id: number; nome: string } | null;
    created_at?: string;
    updated_at?: string;
};

