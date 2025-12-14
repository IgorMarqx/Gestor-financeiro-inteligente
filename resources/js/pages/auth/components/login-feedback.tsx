import { cn } from '@/lib/utils';

interface LoginFeedbackProps {
    status?: string;
    message?: string | null;
    feedbackType?: 'success' | 'error' | null;
}

export function LoginFeedback({
    status,
    message,
    feedbackType = null,
}: LoginFeedbackProps) {
    const content = message ?? status;

    if (!content) {
        return null;
    }

    const isError = feedbackType === 'error';

    return (
        <div
            className={cn(
                'rounded-lg border px-4 py-3 text-sm shadow-sm',
                isError
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700',
            )}
        >
            {content}
        </div>
    );
}
