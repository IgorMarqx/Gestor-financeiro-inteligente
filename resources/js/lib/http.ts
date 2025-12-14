import axios, {
    type AxiosError,
    type AxiosInstance,
    type InternalAxiosRequestConfig,
} from 'axios';

const TOKEN_STORAGE_KEY = 'auth_token';
let inMemoryToken: string | null = null;

const readToken = (): string | null => {
    if (typeof window === 'undefined') {
        return inMemoryToken;
    }

    return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? inMemoryToken;
};

export const setAuthToken = (token: string | null): void => {
    inMemoryToken = token;

    if (typeof window === 'undefined') return;

    if (token) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
};

export const clearAuthToken = (): void => setAuthToken(null);
export const getAuthToken = (): string | null => readToken();

const attachToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = readToken();

    const headers = {
        Accept: 'application/json',
        ...(config.headers ?? {}),
    };

    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    return { ...config, headers };
};

const http: AxiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

http.interceptors.request.use(attachToken);

export const isApiError = (
    error: unknown,
): error is AxiosError<{ message?: string; errors?: Record<string, string[]> }> =>
    axios.isAxiosError(error);

export { http };
