import TextLink from '@/components/text-link';
import { register } from '@/routes';

interface LoginFooterProps {
    canRegister: boolean;
}

export function LoginFooter({ canRegister }: LoginFooterProps) {
    if (!canRegister) return null;

    return (
        <div className="text-center text-sm text-emerald-800">
            Não tem uma conta?{' '}
            <TextLink
                href={register()}
                className="font-semibold text-emerald-700 hover:text-emerald-800"
                tabIndex={5}
            >
                Criar conta
            </TextLink>
        </div>
    );
}
