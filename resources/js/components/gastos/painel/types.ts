import { ApiGasto } from '@/types/ApiGasto';

export type GastoBadgeInfo = {
    isRecorrente: boolean;
    isParcela: boolean;
};

export function getGastoBadges(gasto: ApiGasto): GastoBadgeInfo {
    return {
        isRecorrente: gasto.origem_tipo === 'RECORRENTE',
        isParcela: gasto.origem_tipo === 'PARCELA',
    };
}

