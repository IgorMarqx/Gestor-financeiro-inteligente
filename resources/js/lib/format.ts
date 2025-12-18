export function formatCurrencyBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function parseApiDecimal(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function monthToLabel(month: string): string {
    const [year, monthStr] = month.split('-');
    const date = new Date(Number(year), Number(monthStr) - 1, 1);
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

export function formatDateBR(value: string): string {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('pt-BR').format(date);
}
