import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Mail, Plus, Users } from 'lucide-react';
import MemberCreateDialog from '@/components/familias/member-create-dialog';
import FamilyDeleteDialog from '@/components/familias/family-delete-dialog';
import FamilyLinkTypesCard from '@/components/familias/family-link-types-card';
import FamilyCreateCard from '@/components/familias/family-create-card';
import FamilyNameForm from '@/components/familias/family-name-form';
import { useGetFamilias } from '@/hooks/familias/useGetFamilias';
import { useRemoveMember } from '@/hooks/familias/useRemoveMember';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Familia', href: '/familia' }];


const getInitials = (name: string) => {
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export default function FamiliaIndex() {
    const { familia, loadFamilia, isLoading, errorMessage: loadError } = useGetFamilias();
    const { isSubmitting: isRemoving, errorMessage: removeError, handleRemoveMember } =
        useRemoveMember();

    const [updateError, setUpdateError] = useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [memberDialogOpen, setMemberDialogOpen] = useState(false);

    useEffect(() => {
        void loadFamilia();
    }, [loadFamilia]);

    const membrosOrdenados = useMemo(() => {
        if (!familia?.membros) return [];
        const creatorId = familia.criado_por_user_id;
        return [...familia.membros]
            .sort((a, b) => {
                if (a.id === creatorId) return -1;
                if (b.id === creatorId) return 1;
                return a.name.localeCompare(b.name);
            })
            .map((membro) => ({
                ...membro,
                isOwner: membro.id === creatorId,
                isVinculado: Boolean(membro.pivot?.vinculo),
            }));
    }, [familia]);

    const handleRemoveMemberAction = async (memberId: number) => {
        const ok = await handleRemoveMember(memberId);
        if (ok) {
            await loadFamilia();
        }
    };

    const errorMessage = loadError ?? updateError ?? removeError ?? null;
    const isSubmitting = isRemoving;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Familia" />

            <MemberCreateDialog
                isDialogOpen={memberDialogOpen}
                setIsDialogOpen={setMemberDialogOpen}
                onAddMember={loadFamilia}
            />

            <FamilyDeleteDialog
                isDialogOpen={isDeleteOpen}
                setIsDialogOpen={setIsDeleteOpen}
                onDeleted={async () => {
                    await loadFamilia();
                }}
            />

            <div className="min-h-[calc(100vh-6rem)] bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
                <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-600 p-2 text-white shadow">
                                <Users className="h-5 w-5" />
                            </div>
                            <h1 className="text-2xl font-semibold text-foreground">Familia</h1>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Mantenha todos conectados aos mesmos dados com controle centralizado.
                        </p>
                    </div>

                    {errorMessage ? (
                        <Card>
                            <CardContent className="text-destructive p-4 text-sm">
                                {errorMessage}
                            </CardContent>
                        </Card>
                    ) : null}

                    {isLoading ? (
                        <Card>
                            <CardContent className="p-4 text-sm text-muted-foreground">
                                Carregando familia...
                            </CardContent>
                        </Card>
                    ) : familia ? (
                        <div className="space-y-6">
                            <Card className="border-emerald-100/60">
                                <CardHeader>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2">
                                            <Crown className="h-5 w-5 text-sky-600" />
                                            <CardTitle>Minha familia</CardTitle>
                                        </div>
                                        <Button size="sm" onClick={() => setMemberDialogOpen(true)}>
                                            <Plus className="h-4 w-4" />
                                            Adicionar membro
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        {membrosOrdenados.length}{' '}
                                        {membrosOrdenados.length === 1 ? 'membro' : 'membros'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FamilyNameForm
                                        initialName={familia.nome}
                                        onErrorMessage={setUpdateError}
                                    />

                                    <div className="space-y-3">
                                        {membrosOrdenados.length === 0 ? (
                                            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                                Nenhum membro adicionado ainda.
                                            </div>
                                        ) : (
                                            membrosOrdenados.map((membro) => (
                                                <div
                                                    key={membro.id}
                                                    className="flex flex-col gap-3 rounded-lg border bg-card/80 p-4 shadow-sm sm:flex-row sm:items-center"
                                                >
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarFallback className="bg-sky-600 text-white">
                                                            {getInitials(membro.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {membro.name}
                                                            </p>
                                                            {membro.isOwner && (
                                                                <Badge variant="info">Proprietário</Badge>
                                                            )}
                                                            {membro.isVinculado ? (
                                                                <Badge variant="success">Vinculado</Badge>
                                                            ) : (
                                                                <Badge variant="outline">Desvinculado</Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            <span>{membro.email}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleRemoveMemberAction(membro.id)}
                                                        disabled={isSubmitting}
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <Button
                                        variant="destructive"
                                        onClick={() => setIsDeleteOpen(true)}
                                    >
                                        Excluir familia
                                    </Button>
                                </CardContent>
                            </Card>

                        </div>
                    ) : (
                        <div className="grid w-full gap-6 lg:grid-cols-1">
                            <FamilyCreateCard onCreated={loadFamilia} />
                        </div>
                    )}

                    <FamilyLinkTypesCard />
                </div>
            </div>
        </AppLayout>
    );
}
