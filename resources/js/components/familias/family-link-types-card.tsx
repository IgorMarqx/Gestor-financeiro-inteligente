import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ShieldCheck } from 'lucide-react';

export default function FamilyLinkTypesCard() {
    return (
        <Card className="border-sky-100/60">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-sky-600" />
                    <CardTitle>Tipos de vinculo</CardTitle>
                </div>
                <CardDescription>Entenda como os acessos sao compartilhados hoje.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Membro vinculado</h3>
                        <p className="text-sm text-muted-foreground">
                            Compartilha todos os dados financeiros. Todos podem ver e editar os registros vinculados a
                            familia.
                        </p>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600">•</span>
                                Acesso total aos gastos e receitas
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600">•</span>
                                Controle compartilhado de categorias e contas
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600">•</span>
                                Pode criar, editar e excluir registros
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Permissoes avancadas</h3>
                            <Badge variant="secondary" className="text-[10px]">
                                Em breve
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Perfis com acessos limitados e visoes separadas. Ideal para dependentes ou contas
                            especificas.
                        </p>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600">•</span>
                                Visao parcial das movimentacoes
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600">•</span>
                                Permissoes configuraveis por tipo
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600">•</span>
                                Ajustes finos para cada membro
                            </li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
