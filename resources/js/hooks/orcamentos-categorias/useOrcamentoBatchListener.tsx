import { useEffect } from 'react';
import { useNotifications } from '@/components/notifications/notifications';

export type OrcamentoBatchPayload = {
    batch_id: string;
    user_id: number | string;
    meses: string[];
    categoria_nome: string;
    limite: number;
};

export function useOrcamentoBatchListener(
    userId?: number | string,
    onComplete?: (payload: OrcamentoBatchPayload) => void,
) {
    const { success } = useNotifications();

    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channel = window.Echo.channel(`users.${userId}`);

        channel.listen('.orcamento.batch.finalizado', (payload: OrcamentoBatchPayload) => {
            success('Orçamentos', 'Batch concluído com sucesso.');
            onComplete?.(payload);
        });

        return () => {
            channel.stopListening('.orcamento.batch.finalizado');
            window.Echo.leave(`users.${userId}`);
        };
    }, [userId, success, onComplete]);
}
