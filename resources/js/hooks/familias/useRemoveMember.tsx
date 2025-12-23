import { useNotifications } from '@/components/notifications/notifications';
import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';

export function useRemoveMember() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const handleRemoveMember = async (memberId: number): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await http.delete<ApiResponse<null>>(`/familia/membros/${memberId}`);
            notifications.success('Membro removido', 'O membro foi removido da familia.');
            return true;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message ?? 'Nao foi possivel remover o membro.';
                setErrorMessage(apiMessage);
                notifications.error('Nao foi possivel remover o membro', apiMessage);
            } else {
                setErrorMessage('Nao foi possivel remover o membro.');
                notifications.error('Nao foi possivel remover o membro', 'Ocorreu um erro ao remover o membro.');
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, errorMessage, handleRemoveMember };
}
