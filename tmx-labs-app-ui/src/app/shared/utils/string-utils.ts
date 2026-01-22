export function toUpper(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed.toUpperCase() : null;
}

export function escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case '\'':
                return '&#39;';
            default:
                return char;
        }
    });
}

export function formatLinesAsStackedHtml(
    lines: (string | null | undefined)[],
    className = 'flex flex-col uppercase',
): string {
    const sanitizedLines = lines
        .map((line) => (typeof line === 'string' ? line.trim() : ''))
        .filter((line) => line.length > 0)
        .map((line) => escapeHtml(line));

    if (!sanitizedLines.length) {
        return '';
    }

    const sanitizedClass = typeof className === 'string' ? className.trim() : '';
    const wrapperClass = sanitizedClass.length ? ` class="${escapeHtml(sanitizedClass)}"` : '';
    const content = sanitizedLines.map((line) => `<div>${line}</div>`).join('');
    return `<div${wrapperClass}>${content}</div>`;
}
