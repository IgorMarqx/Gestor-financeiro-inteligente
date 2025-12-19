import { ApiResponse } from '@/types/ApiResponse';
import { http } from './http';

type ReverbConfig = {
    appKey: string;
    host: string;
    port: string | number;
    scheme: string;
};

let cachedConfig: ReverbConfig | null = null;

export async function getReverbConfig(): Promise<ReverbConfig> {
    if (cachedConfig) {
        return cachedConfig;
    }

    const response = await http.get<ApiResponse<{
        VITE_REVERB_APP_KEY?: string;
        VITE_REVERB_HOST?: string;
        VITE_REVERB_PORT?: string | number;
        VITE_REVERB_SCHEME?: string;
    }>>('/reverb/configs');
    const data = response.data.data;

    if (!data?.VITE_REVERB_APP_KEY) {
        throw new Error('Failed to load Reverb config');
    }

    const config: ReverbConfig = {
        appKey: data.VITE_REVERB_APP_KEY,
        host: data.VITE_REVERB_HOST ?? '',
        port: data.VITE_REVERB_PORT ?? '',
        scheme: data.VITE_REVERB_SCHEME ?? 'http',
    };

    cachedConfig = config;
    return config;
}
