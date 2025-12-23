
export type ApiFamiliaMembro = {
    id: number;
    name: string;
    email: string;
    pivot?: {
        vinculo: boolean | number;
    };
};

export type ApiFamilia = {
    id: number;
    nome: string;
    criado_por_user_id: number;
    membros: ApiFamiliaMembro[];
};
