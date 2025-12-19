import {
    type OrcamentoBatchPayload,
    useOrcamentoBatchListener,
} from '@/hooks/orcamentos-categorias/useOrcamentoBatchListener';

export function useGlobalListeners(
    userId?: number | string,
    options?: {
        onOrcamentoBatchComplete?: (payload: OrcamentoBatchPayload) => void;
    },
) {
    useOrcamentoBatchListener(userId, options?.onOrcamentoBatchComplete);
    // futuramente:
    // useOutraListener(userId);
    // useMaisUmListener(userId);
}
