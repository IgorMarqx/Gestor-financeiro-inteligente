import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ModalNotificationOrcamentoCategoria } from '@/components/notifications/ModalNotificationOrcamentoCategoria';
import { type OrcamentoBatchPayload } from '@/hooks/orcamentos-categorias/useOrcamentoBatchListener';
import { useGlobalListeners } from '@/hooks/listeners/useGlobalListeners';
import { type SharedData } from '@/types';

export function GlobalModals() {
    const { auth } = usePage<SharedData>().props;
    const [modalPayload, setModalPayload] = useState<OrcamentoBatchPayload | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useGlobalListeners(auth?.user?.id, {
        onOrcamentoBatchComplete: (payload) => {
            setModalPayload(payload);
            setModalOpen(true);
        },
    });

    return (
        <ModalNotificationOrcamentoCategoria
            open={modalOpen}
            payload={modalPayload}
            onOpenChange={setModalOpen}
        />
    );
}
