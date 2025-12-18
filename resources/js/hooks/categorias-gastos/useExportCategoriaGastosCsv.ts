import { http, isApiError } from '@/lib/http';
import { useCallback, useState } from 'react';
import { useNotifications } from '@/components/notifications/notifications';
import { ApiResponse } from '@/types/ApiResponse';
import { ApiGastoResumoItem } from '@/types/ApiGastoResumoItem';

export function useExportCategoriaGastosCsv() {
    const [isExporting, setIsExporting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const exportCsv = useCallback(async (categoriaId: number, params: { mes?: string; categoriaNome?: string }) => {
        setIsExporting(true);
        setErrorMessage(null);

        try {
            const response = await http.get<ApiResponse<{
                categoria: { id: number; nome: string };
                periodo: { inicio: string; fim: string; mes: string | null };
                gastos: ApiGastoResumoItem[];
            }>>(`/categorias-gastos/${categoriaId}/gastos`, {
                params: { mes: params.mes, limit: 5000 },
            });

            const data = response.data.data;
            const rows = data.gastos ?? [];

            const header = ['id', 'data', 'nome', 'valor'];
            const csvLines = [
                header.join(';'),
                ...rows.map((g) => [
                    String(g.id),
                    String(g.data),
                    `"${String(g.nome).replaceAll('"', '""')}"`,
                    String(g.valor),
                ].join(';')),
            ];

            const csv = csvLines.join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeName = (params.categoriaNome ?? data.categoria?.nome ?? `categoria-${categoriaId}`)
                .trim()
                .replaceAll(/[^\p{L}\p{N}._-]+/gu, '-')
                .slice(0, 60);
            link.download = `${safeName}-${params.mes ?? 'periodo'}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            notifications.success('Exportação concluída', 'CSV baixado com sucesso.');
        } catch (error) {
            const message = isApiError(error)
                ? (error.response?.data?.message ?? 'Erro ao exportar CSV.')
                : 'Erro ao exportar CSV.';
            setErrorMessage(message);
            notifications.error('Não foi possível exportar o CSV', message);
        } finally {
            setIsExporting(false);
        }
    }, [notifications]);

    return { exportCsv, isExporting, errorMessage };
}
