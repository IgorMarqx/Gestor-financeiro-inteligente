import { ApiCategoriaGastoResumo } from '@/types/ApiCategoriaGastoResumo';
import { useMemo } from 'react';

export function statusLabel(status: ApiCategoriaGastoResumo['status']): string {
    if (status === 'estourou') return 'Estourou';
    if (status === 'alerta80') return 'Alerta 80%';
    if (status === 'ok') return 'Ok';
    return 'Sem orçamento';
}

export function iconForCategoria(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('alim') || lower.includes('comida') || lower.includes('merc')) return '🍽️';
    if (lower.includes('trans') || lower.includes('uber') || lower.includes('car')) return '🚗';
    if (lower.includes('lazer') || lower.includes('diver') || lower.includes('cin')) return '🎬';
    if (lower.includes('saúde') || lower.includes('saude') || lower.includes('farm')) return '💊';
    if (lower.includes('casa') || lower.includes('alug')) return '🏠';
    return '🏷️';
}

export function Sparkline(props: { values: number[] }) {
    const points = useMemo(() => {
        if (!props.values.length) return '';
        const max = Math.max(...props.values, 1);
        const width = 110;
        const height = 26;
        return props.values
            .map((v, i) => {
                const x = (i / Math.max(1, props.values.length - 1)) * width;
                const y = height - (v / max) * height;
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(' ');
    }, [props.values]);

    return (
        <svg width="110" height="26" viewBox="0 0 110 26" className="shrink-0">
            <polyline
                fill="none"
                stroke="#009D69"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={points}
            />
        </svg>
    );
}

