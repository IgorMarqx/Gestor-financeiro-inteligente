import { useForm } from "@inertiajs/react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useCreateMember } from "@/hooks/familias/useCreateMember";

type Props = {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onAddMember: () => void;
};

export default function MemberCreateDialog({ isDialogOpen, setIsDialogOpen, onAddMember }: Props) {
    const { isSubmitting, errorMessage, handleAddMember } = useCreateMember();

    const { data, setData, reset } = useForm({
        novo_membro_nome: '',
        novo_membro_email: '',
        novo_membro_cpf: '',
        novo_membro_telefone: '',
        novo_membro_senha: '',
    })

    return (
        <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    reset();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar membro</DialogTitle>
                    <DialogDescription>
                        Informe os dados para vincular ou criar o membro. Se o usuario nao existir,
                        o cadastro sera criado automaticamente com base nas informacoes informadas.
                    </DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                )}


                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="novo_membro_nome">Nome</Label>
                        <Input
                            id="novo_membro_nome"
                            value={data.novo_membro_nome}
                            onChange={(e) => setData('novo_membro_nome', e.target.value)}
                            placeholder="Nome do membro"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="novo_membro_email">Email</Label>
                        <Input
                            id="novo_membro_email"
                            value={data.novo_membro_email}
                            onChange={(e) => setData('novo_membro_email', e.target.value)}
                            placeholder="email@exemplo.com"
                        />
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="novo_membro_cpf">CPF</Label>
                        <Input
                            id="novo_membro_cpf"
                            value={data.novo_membro_cpf}
                            onChange={(e) => setData('novo_membro_cpf', e.target.value)}
                            placeholder="000.000.000-00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="novo_membro_telefone">Telefone</Label>
                        <Input
                            id="novo_membro_telefone"
                            value={data.novo_membro_telefone}
                            onChange={(e) => setData('novo_membro_telefone', e.target.value)}
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="novo_membro_senha">Senha (opcional)</Label>
                    <Input
                        id="novo_membro_senha"
                        type="text"
                        value={data.novo_membro_senha}
                        onChange={(e) => setData('novo_membro_senha', e.target.value)}
                        placeholder="Deixe em branco para gerar automaticamente"
                    />
                    <p className="text-xs text-muted-foreground">
                        Se nao informar, a senha sera criada automaticamente com base nos 4 primeiros
                        caracteres do email, 3 primeiros digitos do CPF e 2 primeiros digitos do telefone.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={async () => {
                            const ok = await handleAddMember({
                                nome: data.novo_membro_nome,
                                email: data.novo_membro_email,
                                cpf: data.novo_membro_cpf,
                                telefone: data.novo_membro_telefone,
                                senha: data.novo_membro_senha,
                            });
                            if (ok) {
                                onAddMember();
                                setIsDialogOpen(false);
                                reset();
                            }
                        }}
                        disabled={isSubmitting || data.novo_membro_email.trim() === ''}
                    >
                        Adicionar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
