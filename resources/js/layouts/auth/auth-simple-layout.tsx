import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 text-emerald-900 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.14),transparent_35%)]" />
            <div className="pointer-events-none absolute top-1/4 -left-24 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

            <div className="relative w-full max-w-lg">
                <div className="flex flex-col gap-8 rounded-3xl border border-emerald-100/80 bg-white/85 p-8 shadow-2xl shadow-emerald-200/60 backdrop-blur md:p-10">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-3 font-medium text-emerald-800 transition hover:text-emerald-900"
                        >
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 shadow-emerald-100 ring-emerald-100/80">
                                <img
                                    src="/assets/imgs/logo_financeiro.png"
                                    alt="Gestor Financeiro Inteligente"
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <span className="text-sm font-semibold tracking-tight text-emerald-900">
                                Gestor Financeiro Inteligente
                            </span>
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-2xl leading-7 font-semibold">
                                {title}
                            </h1>
                            <p className="text-sm text-emerald-800/80">
                                {description}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">{children}</div>
                </div>
            </div>
        </div>
    );
}
