export type ApiGastoParcela = {
    id: number;
    parcelamento_id: number;
    usuario_id?: number;
    numero_parcela: number;
    valor: string;
    vencimento: string;
    gasto_id: number | null;
    status: 'PENDENTE' | 'GERADO' | 'PAGO';
    parcelamento?: {
        id: number;
        nome: string;
        parcelas_total: number;
        categoria?: { id: number; nome: string } | null;
    } | null;
    gasto?: { id: number; data: string; valor: string } | null;
};

