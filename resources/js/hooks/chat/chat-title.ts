export function deriveChatTitleFromPrompt(prompt: string) {
    const cleaned = prompt
        .replace(/\s+/g, ' ')
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .trim();
    if (!cleaned) return 'Novo Chat';

    const words = cleaned.split(' ').slice(0, 6).join(' ');
    const title = words.length > 48 ? `${words.slice(0, 48).trim()}…` : words;
    return title.charAt(0).toUpperCase() + title.slice(1);
}

