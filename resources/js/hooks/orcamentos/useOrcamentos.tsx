import { http, isApiError } from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';
import { useEffect, useState } from 'react';

export type OrcamentoResumoItem = {
    categoria_gasto_id: number;
    categoria_nome: string;
    limite: string;
    gasto_atual: string;
    percentual: number;
    status: 'ok' | 'alerta80' | 'estourou';
};

export function useOrcamentos(mes: string) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resumo, setResumo] = useState<OrcamentoResumoItem[]>([]);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const response = await http.get<ApiResponse<OrcamentoResumoItem[]>>(
                    '/orcamentos-categorias/resumo',
                    { params: { mes } },
                );
                setResumo(response.data.data ?? []);
            } catch (error) {
                if (isApiError(error)) {
                    setErrorMessage(
                        error.response?.data?.message ?? 'Erro ao carregar orçamentos.',
                    );
                } else {
                    setErrorMessage('Erro ao carregar orçamentos.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [mes]);

    return { isLoading, errorMessage, resumo };
}

