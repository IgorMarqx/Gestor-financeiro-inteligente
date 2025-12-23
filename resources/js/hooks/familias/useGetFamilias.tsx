import { http, isApiError } from '@/lib/http';
import { ApiFamilia } from '@/types/ApiFamilia';
import { ApiResponse } from '@/types/ApiResponse';
import { useCallback, useState } from 'react';

export function useGetFamilias() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [familia, setFamilia] = useState<ApiFamilia | null>(null);

    const loadFamilia = useCallback(async (): Promise<ApiFamilia | null> => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await http.get<ApiResponse<ApiFamilia | null>>('/familia');
            const data = response.data.data ?? null;
            setFamilia(data);
            return data;
        } catch (error) {
            if (isApiError(error)) {
                setErrorMessage(error.response?.data?.message ?? 'Erro ao carregar familia.');
            } else {
                setErrorMessage('Erro ao carregar familia.');
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { familia, loadFamilia, isLoading, errorMessage };
}
