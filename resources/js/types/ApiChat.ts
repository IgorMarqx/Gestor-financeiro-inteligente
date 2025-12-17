export type ApiChat = {
    id: number;
    usuario_id: number;
    titulo: string | null;
    contexto: unknown[] | Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
};

