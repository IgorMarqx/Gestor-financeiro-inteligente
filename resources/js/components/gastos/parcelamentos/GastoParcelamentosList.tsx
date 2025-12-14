import { AlertToast } from '@/components/gastos/painel/AlertToast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGerarLancamentosParcelas } from '@/hooks/gastos-parcelamentos/useGerarLancamentosParcelas';
import { useGerarParcelas } from '@/hooks/gastos-parcelamentos/useGerarParcelas';
import { useGastosParcelamentos } from '@/hooks/gastos-parcelamentos/useGastosParcelamentos';
import { useToggleGastoParcelamento } from '@/hooks/gastos-parcelamentos/useToggleGastoParcelamento';
import { useEffect } from 'react';

type Props = {
    refreshSignal: number;
};

export function GastoParcelamentosList({ refreshSignal }: Props) {
    const { data, isLoading, errorMessage, page, setPage, reload } = useGastosParcelamentos(15);
    const { gerarParcelas, isSubmitting: isGerandoParcelas, errorMessage: gerarParcelasError } =
        useGerarParcelas();
    const {
        gerarLancamentos,
        isSubmitting: isGerandoLancamentos,
        errorMessage: gerarLancamentosError,
    } = useGerarLancamentosParcelas();
    const { setAtivo, isSubmitting: isToggling, errorMessage: toggleError } =
        useToggleGastoParcelamento();

    useEffect(() => {
        void reload();
    }, [refreshSignal]);

    const itens = data?.itens ?? [];

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold">Parcelamentos</p>
                    <p className="text-muted-foreground text-xs">
                        Gere parcelas (1x) e depois gere lançamentos vencidos.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    disabled={isGerandoLancamentos}
                    onClick={async () => {
                        const res = await gerarLancamentos();
                        if (!res) return;
                        await reload();
                    }}
                >
                    {isGerandoLancamentos ? 'Gerando...' : 'Gerar lançamentos vencidos'}
                </Button>
            </div>

            {errorMessage ? <AlertToast title="Erro" description={errorMessage} /> : null}
            {gerarParcelasError ? <AlertToast title="Erro" description={gerarParcelasError} /> : null}
            {gerarLancamentosError ? (
                <AlertToast title="Erro" description={gerarLancamentosError} />
            ) : null}
            {toggleError ? <AlertToast title="Erro" description={toggleError} /> : null}

            <Card>
                <CardContent className="p-4">
                    {isLoading ? (
                        <p className="text-muted-foreground text-sm">Carregando...</p>
                    ) : itens.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nenhum parcelamento.</p>
                    ) : (
                        <div className="space-y-3">
                            {itens.map((p) => (
                                <div key={p.id} className="space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {p.nome}{' '}
                                                <span className="text-muted-foreground font-normal">
                                                    • {p.parcelas_total}x
                                                </span>
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {p.categoria?.nome ?? `Categoria #${p.categoria_gasto_id}`} •{' '}
                                                Início {p.data_inicio} • Total R${' '}
                                                {Number(p.valor_total).toFixed(2).replace('.', ',')}
                                            </p>
                                            {p.descricao ? (
                                                <p className="text-muted-foreground mt-1 text-xs line-clamp-2">
                                                    {p.descricao}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-xs">
                                                Status:{' '}
                                                <span className={p.ativo ? 'text-emerald-600' : 'text-amber-600'}>
                                                    {p.ativo ? 'Ativo' : 'Pausado'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isGerandoParcelas}
                                            onClick={async () => {
                                                const res = await gerarParcelas(p.id);
                                                if (!res) return;
                                                await reload();
                                            }}
                                        >
                                            {isGerandoParcelas ? 'Gerando...' : 'Gerar parcelas'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isToggling}
                                            onClick={async () => {
                                                const updated = await setAtivo(p.id, !p.ativo);
                                                if (!updated) return;
                                                await reload();
                                            }}
                                        >
                                            {p.ativo ? 'Pausar' : 'Ativar'}
                                        </Button>
                                    </div>
                                    <Separator />
                                </div>
                            ))}
                        </div>
                    )}

                    {data?.paginacao ? (
                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-muted-foreground text-xs">
                                Página {data.paginacao.pagina_atual} de {data.paginacao.ultima_pagina}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= (data.paginacao.ultima_pagina ?? 1)}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
