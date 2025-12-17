export type Point = { x: number; y: number };
export type Size = { width: number; height: number };

export const CHAT_BUTTON_SIZE = 56;
export const CHAT_GAP = 10;
export const CHAT_PADDING = 12;

export const CHAT_POS_STORAGE_KEY = 'chat_widget_pos_v1';
export const CHAT_SIZE_STORAGE_KEY = 'chat_panel_size_v1';

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function safeParseJson<T>(value: string | null): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

export function getViewport() {
    return { width: window.innerWidth, height: window.innerHeight };
}

export function clampButtonPosition(pos: Point) {
    const { width, height } = getViewport();
    return {
        x: clamp(pos.x, CHAT_PADDING, width - CHAT_PADDING - CHAT_BUTTON_SIZE),
        y: clamp(pos.y, CHAT_PADDING, height - CHAT_PADDING - CHAT_BUTTON_SIZE),
    };
}

export function defaultButtonPosition(): Point {
    const { width, height } = getViewport();
    return clampButtonPosition({
        x: width - CHAT_PADDING - CHAT_BUTTON_SIZE,
        y: height - CHAT_PADDING - CHAT_BUTTON_SIZE,
    });
}

export function defaultPanelSize(): Size {
    return { width: 380, height: 520 };
}

