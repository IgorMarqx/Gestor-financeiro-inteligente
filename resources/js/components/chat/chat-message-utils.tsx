import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatMessageContent({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
                a: ({ children, href }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00A56D] underline"
                    >
                        {children}
                    </a>
                ),
                ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                table: ({ children }) => (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-left text-xs">{children}</table>
                    </div>
                ),
                thead: ({ children }) => <thead className="bg-muted/40">{children}</thead>,
                th: ({ children }) => <th className="px-3 py-2 font-medium">{children}</th>,
                td: ({ children }) => <td className="px-3 py-2">{children}</td>,
                tr: ({ children }) => <tr className="border-t">{children}</tr>,
                code: ({ children }) => (
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">{children}</code>
                ),
                pre: ({ children }) => (
                    <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs">
                        {children}
                    </pre>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-muted-foreground/40 pl-3 text-muted-foreground">
                        {children}
                    </blockquote>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
