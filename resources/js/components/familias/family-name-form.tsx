import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUpdateFamilia } from '@/hooks/familias/useUpdateFamilia';

type FamilyNameFormProps = {
    initialName: string;
    onErrorMessage?: (message: string | null) => void;
};

export default function FamilyNameForm({ initialName, onErrorMessage }: FamilyNameFormProps) {
    const { isSubmitting, errorMessage, handleUpdateFamilia } = useUpdateFamilia();
    const [nomeFamilia, setNomeFamilia] = useState(initialName);
    const isDirty = nomeFamilia.trim() !== initialName.trim();

    useEffect(() => {
        setNomeFamilia(initialName);
    }, [initialName]);

    useEffect(() => {
        onErrorMessage?.(errorMessage);
    }, [errorMessage, onErrorMessage]);

    const handleSave = async () => {
        await handleUpdateFamilia(nomeFamilia);
    };

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
                <Label htmlFor="familia_nome">Nome da familia</Label>
                <Input
                    id="familia_nome"
                    value={nomeFamilia}
                    onChange={(e) => setNomeFamilia(e.target.value)}
                    placeholder="Nome da familia"
                />
            </div>
            <Button onClick={handleSave} disabled={isSubmitting || !isDirty || nomeFamilia.trim() === ''}>
                Salvar
            </Button>
        </div>
    );
}
