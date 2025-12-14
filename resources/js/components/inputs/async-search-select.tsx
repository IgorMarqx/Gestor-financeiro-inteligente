import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type AsyncSearchSelectOption = { value: string; label: string };

type Props = {
    label: string;
    placeholder?: string;
    value: string | null;
    onChange: (value: string | null) => void;
    loadOptions: (query: string) => Promise<AsyncSearchSelectOption[]>;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
};

export function AsyncSearchSelect({
    label,
    placeholder = 'Selecione...',
    value,
    onChange,
    loadOptions,
    emptyMessage = 'Nenhuma opção encontrada.',
    disabled = false,
    className,
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<AsyncSearchSelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const selected = useMemo(
        () => options.find((o) => o.value === value) ?? null,
        [options, value],
    );

    useEffect(() => {
        if (!open) return;

        let isCancelled = false;
        queueMicrotask(() => {
            if (isCancelled) return;
            setIsLoading(true);
            setErrorMessage(null);
        });

        void loadOptions(query)
            .then((data) => {
                if (isCancelled) return;
                setOptions(data);
            })
            .catch(() => {
                if (isCancelled) return;
                setErrorMessage('Erro ao carregar opções.');
            })
            .finally(() => {
                if (isCancelled) return;
                setIsLoading(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [open, query, loadOptions]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        'border-input bg-background flex h-9 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none',
                        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                        'disabled:pointer-events-none disabled:opacity-50',
                        className,
                    )}
                >
                    <span className={cn('truncate', !selected && 'text-muted-foreground')}>
                        {selected?.label ?? placeholder}
                    </span>
                    <ChevronDown className="ml-2 size-4 opacity-60" />
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{label}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Pesquisar..."
                            className="pl-9"
                        />
                    </div>

                    {errorMessage ? (
                        <p className="text-destructive text-sm">{errorMessage}</p>
                    ) : null}

                    <div className="max-h-72 overflow-auto rounded-md border">
                        {isLoading ? (
                            <div className="text-muted-foreground p-3 text-sm">
                                Carregando...
                            </div>
                        ) : options.length === 0 ? (
                            <div className="text-muted-foreground p-3 text-sm">
                                {emptyMessage}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {options.map((option) => {
                                    const isSelected = option.value === value;
                                    return (
                                        <Button
                                            key={option.value}
                                            variant="ghost"
                                            className={cn(
                                                'h-auto w-full justify-start gap-2 rounded-none px-3 py-2 text-left',
                                            )}
                                            onClick={() => {
                                                onChange(option.value);
                                                setOpen(false);
                                            }}
                                        >
                                            <span className="flex-1 truncate">
                                                {option.label}
                                            </span>
                                            {isSelected ? (
                                                <Check className="size-4" />
                                            ) : null}
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onChange(null);
                                setOpen(false);
                            }}
                            disabled={disabled || value === null}
                        >
                            Limpar
                        </Button>
                        <Button type="button" onClick={() => setOpen(false)}>
                            Fechar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
