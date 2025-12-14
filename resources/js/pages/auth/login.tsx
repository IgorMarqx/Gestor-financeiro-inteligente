import AuthLayout from '@/layouts/auth-layout';
import { LoginFeedback } from '@/pages/auth/components/login-feedback';
import { LoginFooter } from '@/pages/auth/components/login-footer';
import { LoginForm } from '@/pages/auth/components/login-form';
import { useAuth } from '@/hooks/use-auth';
import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const { login, loading, errors, message, feedbackType } = useAuth();

    const handleLogin = useCallback(
        async (payload: Parameters<typeof login>[0]) => {
            const response = await login(payload);

            if (response.ok) {
                router.visit('/dashboard');
            }
        },
        [login],
    );

    return (
        <AuthLayout
            title="Acesse sua conta"
            description="Organize suas finanças com um toque de verde e segurança"
        >
            <Head title="Login" />

            <div className="flex flex-col gap-4">
                <LoginFeedback
                    status={status}
                    message={message}
                    feedbackType={feedbackType}
                />

                <LoginForm
                    canResetPassword={canResetPassword}
                    loading={loading}
                    errors={errors}
                    onSubmit={handleLogin}
                />

                <LoginFooter canRegister={canRegister} />
            </div>
        </AuthLayout>
    );
}
