import { useNotifications } from "@/components/notifications/notifications";
import { http, isApiError } from "@/lib/http";
import { useState } from "react";

type CreateMemberPayload = {
    nome?: string;
    email: string;
    cpf?: string;
    telefone?: string;
    senha?: string;
};

export function useCreateMember() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications();

    const handleAddMember = async ({
        nome = "",
        email,
        cpf = "",
        telefone = "",
        senha = "",
    }: CreateMemberPayload): Promise<boolean> => {
        const trimmedPayload = trimMemberPayload({ nome, email, cpf, telefone, senha });
        if (!trimmedPayload.email) return false;

        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            await http.post("/familia/membros", {
                nome: trimmedPayload.nome || null,
                email: trimmedPayload.email,
                cpf: trimmedPayload.cpf || null,
                telefone: trimmedPayload.telefone || null,
                senha: trimmedPayload.senha || null,
            });
            notifications.success('Membro adicionado', 'O membro foi adicionado com sucesso à família.');
            return true;
        } catch (error) {
            if (isApiError(error)) {
                const apiMessage = error.response?.data?.message;
                const apiErrors = error.response?.data?.errors;
                const firstFieldError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null;
                const message = firstFieldError ?? apiMessage ?? 'Erro ao criar gasto.';
                setErrorMessage(message);
                notifications.error('Não foi possível adicionar o membro', message);
            } else {
                setErrorMessage('Erro ao adicionar o membro.');
                notifications.error('Não foi possível adicionar o membro', 'Erro ao adicionar o membro.');
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    function trimMemberPayload({ nome = "", email, cpf = "", telefone = "", senha = "" }: CreateMemberPayload) {
        return {
            nome: nome.trim(),
            email: email.trim(),
            cpf: cpf.trim(),
            telefone: telefone.trim(),
            senha: senha.trim(),
        };
    }

    return { isSubmitting, errorMessage, handleAddMember };
}
