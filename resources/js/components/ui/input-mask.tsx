import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputMaskType = 'money' | 'cpf' | 'rg' | 'cnpj';

export type InputMaskValueChange = {
    value: string;
    raw: string;
};

type Props = Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & {
    mask: InputMaskType;
    value: string;
    onValueChange: (next: InputMaskValueChange) => void;
};

const onlyDigits = (value: string): string => value.replace(/\D+/g, '');

const applyCpfMask = (digits: string): string => {
    const d = digits.slice(0, 11);
    const p1 = d.slice(0, 3);
    const p2 = d.slice(3, 6);
    const p3 = d.slice(6, 9);
    const p4 = d.slice(9, 11);

    if (d.length <= 3) return p1;
    if (d.length <= 6) return `${p1}.${p2}`;
    if (d.length <= 9) return `${p1}.${p2}.${p3}`;
    return `${p1}.${p2}.${p3}-${p4}`;
};

const applyCnpjMask = (digits: string): string => {
    const d = digits.slice(0, 14);
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 8);
    const p4 = d.slice(8, 12);
    const p5 = d.slice(12, 14);

    if (d.length <= 2) return p1;
    if (d.length <= 5) return `${p1}.${p2}`;
    if (d.length <= 8) return `${p1}.${p2}.${p3}`;
    if (d.length <= 12) return `${p1}.${p2}.${p3}/${p4}`;
    return `${p1}.${p2}.${p3}/${p4}-${p5}`;
};

const applyRgMask = (digits: string): string => {
    const d = digits.slice(0, 9);
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 8);
    const p4 = d.slice(8, 9);

    if (d.length <= 2) return p1;
    if (d.length <= 5) return `${p1}.${p2}`;
    if (d.length <= 8) return `${p1}.${p2}.${p3}`;
    return `${p1}.${p2}.${p3}-${p4}`;
};

const applyMoneyMask = (digits: string): string => {
    const d = digits.replace(/^0+(?=\d)/, '').slice(0, 15);
    const cents = d.padStart(3, '0');
    const intPart = cents.slice(0, -2);
    const fracPart = cents.slice(-2);

    const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withThousands},${fracPart}`;
};

const applyMask = (mask: InputMaskType, inputValue: string): InputMaskValueChange => {
    const raw = onlyDigits(inputValue);

    if (mask === 'cpf') return { raw: raw.slice(0, 11), value: applyCpfMask(raw) };
    if (mask === 'cnpj') return { raw: raw.slice(0, 14), value: applyCnpjMask(raw) };
    if (mask === 'rg') return { raw: raw.slice(0, 9), value: applyRgMask(raw) };
    return { raw, value: applyMoneyMask(raw) };
};

function InputMask({ className, type, mask, value, onValueChange, ...props }: Props) {
    const inputMode = mask === 'money' ? 'decimal' : 'numeric';

    return (
        <input
            type={type ?? 'text'}
            data-slot="input"
            inputMode={inputMode}
            className={cn(
                'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className,
            )}
            value={value}
            onChange={(e) => {
                const next = applyMask(mask, e.target.value);
                onValueChange(next);
            }}
            {...props}
        />
    );
}

export { InputMask };

