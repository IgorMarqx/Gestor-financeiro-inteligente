import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet } from 'lucide-react';

type Props = {
    totalPeriodo: number;
    media3Meses: number;
    periodLabel: string;
};

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

const formatDatePtBr = (iso: string): string => {
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

const formatPeriodPtBr = (label: string): string => {
    const parts = label.split('→').map((p) => p.trim());
    if (parts.length !== 2) return label;
    return `${formatDatePtBr(parts[0])} → ${formatDatePtBr(parts[1])}`;
};

function SummaryCard({
    title,
    total,
    period,
    icon,
}: {
    title: string;
    total: number;
    period?: string;
    icon?: React.ReactNode;
}) {
    return (
        <Card className="border-[#1AAC63]/20 bg-gradient-to-br from-white to-[#1AAC63]/5 dark:from-card dark:to-[#1AAC63]/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon ? (
                    <div className="rounded-full bg-[#1AAC63]/10 p-2 text-[#1AAC63]">
                        {icon}
                    </div>
                ) : null}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-[#1AAC63]">
                    {formatCurrency(total)}
                </div>
                {period ? <p className="mt-1 text-xs text-muted-foreground">{period}</p> : null}
            </CardContent>
        </Card>
    );
}

export function SummaryCards({ totalPeriodo, media3Meses, periodLabel }: Props) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <SummaryCard
                title="Total do período"
                total={totalPeriodo}
                period={formatPeriodPtBr(periodLabel)}
                icon={<Wallet className="size-4" />}
            />
            <SummaryCard
                title="Média mensal (últimos 3 meses)"
                total={media3Meses}
                period="Baseado no total de gastos por mês"
                icon={<TrendingUp className="size-4" />}
            />
        </div>
    );
}
