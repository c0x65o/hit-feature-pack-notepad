'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Card({ title, subtitle, children, footer, className = '' }) {
    return (_jsxs("div", { className: `bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg ${className}`, children: [(title || subtitle) && (_jsxs("div", { className: "px-6 py-4 border-b border-[var(--hit-border)]", children: [title && _jsx("h3", { className: "text-lg font-semibold text-[var(--hit-foreground)]", children: title }), subtitle && _jsx("p", { className: "mt-1 text-sm text-[var(--hit-muted-foreground)]", children: subtitle })] })), _jsx("div", { className: "p-6", children: children }), footer && (_jsx("div", { className: "px-6 py-4 border-t border-[var(--hit-border)] bg-[var(--hit-muted)]", children: footer }))] }));
}
//# sourceMappingURL=Card.js.map