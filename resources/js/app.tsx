import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NotificationsProvider } from '@/components/notifications/notifications';
import { initializeTheme } from './hooks/use-appearance';
import { getReverbConfig } from './lib/reverb-config';

// Echo/Reverb
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

void getReverbConfig()
    .then((config) => {
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: config.appKey,
            cluster: 'mt1',
            wsHost: config.host || window.location.hostname,
            wsPort: Number(config.port || 8080),
            wssPort: Number(config.port || 8080),
            forceTLS: config.scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/api/broadcasting/auth',
        });

    })
    .catch((error) => {
        console.error('Reverb config error:', error);
    });

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <NotificationsProvider>
                    <App {...props} />
                </NotificationsProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
