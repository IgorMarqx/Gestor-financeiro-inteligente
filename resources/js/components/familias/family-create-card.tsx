import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCreateFamilias } from '@/hooks/familias/useCreateFamilias';

type FamilyCreateCardProps = {
    onCreated?: () => void;
};

export default function FamilyCreateCard({ onCreated }: FamilyCreateCardProps) {
    const { isSubmitting, success, handleCreateFamilia } = useCreateFamilias();
    const [novoNome, setNovoNome] = useState('');

    useEffect(() => {
        if (success) {
            setNovoNome('');
            onCreated?.();
        }
    }, [success]);

    return (
        <Card className="border-sky-100/60">
            <CardHeader>
                <CardTitle>Criar familia</CardTitle>
                <CardDescription>
                    Compartilhe o controle financeiro com pessoas de confianca.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="novo_nome">Nome da familia</Label>
                        <Input
                            id="novo_nome"
                            value={novoNome}
                            onChange={(e) => setNovoNome(e.target.value)}
                            placeholder="Ex: Familia Silva"
                        />
                    </div>

                    <Button onClick={() => handleCreateFamilia(novoNome)} disabled={isSubmitting || novoNome.trim() === ''}>
                        Criar familia
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
