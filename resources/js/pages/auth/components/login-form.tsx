import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { LoginPayload } from '@/hooks/use-auth';
import { request } from '@/routes/password';
import { FormEvent, useMemo, useState } from 'react';

interface LoginFormProps {
    canResetPassword: boolean;
    loading: boolean;
    errors?: Partial<Record<keyof LoginPayload, string[]>>;
    onSubmit: (payload: LoginPayload) => Promise<void>;
}

export function LoginForm({
    canResetPassword,
    loading,
    errors = {},
    onSubmit,
}: LoginFormProps) {
    const [form, setForm] = useState<LoginPayload>({
        email: '',
        password: '',
        remember: false,
    });

    const disableSubmit = useMemo(
        () => loading || !form.email || !form.password,
        [form.email, form.password, loading],
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-6">

                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-emerald-900">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        required
                        autoFocus
                        autoComplete="email"
                        placeholder="email@exemplo.com"
                        value={form.email}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                email: event.target.value,
                            }))
                        }
                        className="h-11 rounded-xl border-emerald-100 bg-emerald-50/40 focus-visible:border-emerald-500 focus-visible:ring-emerald-200/80"
                    />
                    <InputError message={errors.email?.[0]} />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password" className="text-emerald-900">
                            Senha
                        </Label>
                        {canResetPassword && (
                            <TextLink
                                href={request()}
                                className="ml-auto text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                tabIndex={5}
                            >
                                Esqueceu a senha?
                            </TextLink>
                        )}
                    </div>

                    <Input
                        id="password"
                        type="password"
                        name="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                password: event.target.value,
                            }))
                        }
                        className="h-11 rounded-xl border-emerald-100 bg-emerald-50/40 focus-visible:border-emerald-500 focus-visible:ring-emerald-200/80"
                    />
                    <InputError message={errors.password?.[0]} />
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={form.remember}
                        onCheckedChange={(checked) =>
                            setForm((prev) => ({
                                ...prev,
                                remember: !!checked,
                            }))
                        }
                        className="focus-visible:ring-emerald-200 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600" />
                    <Label htmlFor="remember" className="text-emerald-900">
                        Lembrar de mim
                    </Label>
                </div>

                <Button
                    type="submit"
                    className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/70 transition hover:from-emerald-600 hover:to-emerald-700 focus-visible:ring-emerald-300 disabled:opacity-70 cursor-pointer"
                    disabled={disableSubmit}
                    data-test="login-button"
                >
                    {loading && <Spinner className="text-white" />}
                    Entrar
                </Button>
            </div>
        </form>
    );
}
