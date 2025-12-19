const toCents = (value: number): number => Math.round(value * 100);
const centsToRaw = (cents: number): string => String(Math.max(0, cents));

function maskedFromRaw(raw: string): string {
    const digits = raw.replace(/\D+/g, '');
    const d = digits.replace(/^0+(?=\d)/, '').slice(0, 15);
    const cents = d.padStart(3, '0');
    const intPart = cents.slice(0, -2);
    const fracPart = cents.slice(-2);
    const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withThousands},${fracPart}`;
}

export function moneyToRaw(value: number): string {
    return centsToRaw(toCents(value));
}

export function rawToMoney(raw: string): number {
    const cents = Number(raw || '0');
    return cents / 100;
}

export function rawToMaskedMoney(raw: string): string {
    if (!raw) return '';
    return maskedFromRaw(raw);
}

