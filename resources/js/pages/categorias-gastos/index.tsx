import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateCategoriaGasto } from '@/hooks/categorias-gastos/useCreateCategoriaGasto';
import { useGetCategoriasGastos } from '@/hooks/categorias-gastos/useGetCategoriasGastos';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Categorias', href: '/categorias' }];

export default function CategoriasGastosIndex() {
    const { loadCategorias, isLoading, errorMessage, categorias } = useGetCategoriasGastos();
    const {
        createCategoria,
        isSubmitting,
        errorMessage: createErrorMessage,
    } = useCreateCategoriaGasto();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [nome, setNome] = useState('');
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return categorias;
        const q = query.trim().toLowerCase();
        return categorias.filter((c) => c.nome.toLowerCase().includes(q));
    }, [categorias, query]);

    useEffect(() => {
        void loadCategorias();
    }, []);

    const onCreate = async () => {
        const created = await createCategoria({ nome: nome.trim() });
        if (!created) return;

        setIsDialogOpen(false);
        setNome('');
        void loadCategorias();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorias" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold">Categorias</h1>
                        <p className="text-muted-foreground text-sm">
                            Organize seus gastos por categoria.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 size-4" />
                                Criar categoria
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Nova categoria</DialogTitle>
                                <DialogDescription>
                                    Dê um nome para sua categoria.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome</label>
                                <Input
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Ex: Alimentação"
                                />
                            </div>

                            {createErrorMessage ? (
                                <p className="text-destructive text-sm">{createErrorMessage}</p>
                            ) : null}

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={onCreate} disabled={isSubmitting}>
                                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="relative">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquisar categorias..."
                        className="pl-9"
                    />
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {isLoading ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Carregando...</CardTitle>
                            </CardHeader>
                        </Card>
                    ) : errorMessage ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Erro</CardTitle>
                            </CardHeader>
                            <CardContent className="text-destructive text-sm">
                                {errorMessage}
                            </CardContent>
                        </Card>
                    ) : filtered.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Nenhuma categoria</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                Crie uma categoria para começar.
                            </CardContent>
                        </Card>
                    ) : (
                        filtered.map((categoria) => (
                            <Card key={categoria.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <p className="font-medium">{categoria.nome}</p>
                                    <span className="text-muted-foreground text-xs">
                                        #{categoria.id}
                                    </span>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

