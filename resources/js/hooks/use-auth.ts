import { useCallback, useMemo, useState } from 'react';
import type { User } from '@/types';
import {
    clearAuthToken,
    getAuthToken,
    http,
    isApiError,
    setAuthToken,
} from '@/lib/http';
import { ApiResponse } from '@/types/ApiResponse';

export interface LoginPayload {
    email: string;
    password: string;
    remember?: boolean;
}

export interface LoginResult {
    ok: boolean;
    message?: string;
    user?: User;
    token?: string;
    errors?: Partial<Record<keyof LoginPayload, string[]>>;
}

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(getAuthToken());
    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
    const [errors, setErrors] = useState<
        Partial<Record<keyof LoginPayload, string[]>>
    >({});

    const login = useCallback(
        async (payload: LoginPayload): Promise<LoginResult> => {
            setLoading(true);
            setErrors({});
            setMessage(null);

            try {
                const response = await http.post<ApiResponse<{ token: string; user: User }>>(
                    '/auth/login',
                    payload,
                );

                const tokenValue = response.data.data.token;
                const userValue = response.data.data.user;

                setUser(userValue);
                setToken(tokenValue);
                setMessage(response.data.message ?? null);
                setFeedbackType('success');
                setAuthToken(tokenValue);

                return { ok: true, user: userValue, token: tokenValue };
            } catch (error) {
                if (isApiError(error)) {
                    const apiErrors = error.response?.data?.errors ?? {};
                    const apiMessage =
                        error.response?.data?.message ??
                        'Não foi possível entrar.';

                    setErrors(apiErrors as Partial<Record<keyof LoginPayload, string[]>>);
                    setMessage(apiMessage);
                    setFeedbackType('error');

                    return { ok: false, message: apiMessage, errors: apiErrors };
                }

                setMessage('Falha na comunicação com o servidor.');
                setFeedbackType('error');

                return { ok: false, message: 'Falha na comunicação com o servidor.' };
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const logout = useCallback(async (): Promise<void> => {
        setLoading(true);
        setMessage(null);
        setFeedbackType(null);

        try {
            await http.post('/auth/logout');
        } finally {
            clearAuthToken();
            setUser(null);
            setToken(null);
            setLoading(false);
        }
    }, []);

    const clearMessage = useCallback(() => {
        setMessage(null);
        setFeedbackType(null);
    }, []);

    const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

    return {
        login,
        logout,
        loading,
        token,
        user,
        message,
        feedbackType,
        errors,
        hasErrors,
        clearMessage,
    };
};
