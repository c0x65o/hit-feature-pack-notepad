'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
const variantStyles = {
    primary: 'bg-[var(--hit-primary)] hover:bg-[var(--hit-primary-hover)] text-white',
    secondary: 'bg-[var(--hit-secondary)] hover:bg-[var(--hit-secondary-hover)] text-white',
    outline: 'border border-[var(--hit-border)] hover:bg-[var(--hit-surface-hover)] text-[var(--hit-foreground)]',
    ghost: 'hover:bg-[var(--hit-surface-hover)] text-[var(--hit-foreground)]',
    danger: 'bg-[var(--hit-error)] hover:bg-[var(--hit-error-dark)] text-white',
};
const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
};
export function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, loading, disabled, children, className = '', ...props }) {
    return (_jsxs("button", { className: `inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`, disabled: disabled || loading, ...props, children: [loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : Icon ? (_jsx(Icon, { className: "w-4 h-4" })) : null, children, IconRight && !loading && _jsx(IconRight, { className: "w-4 h-4" })] }));
}
//# sourceMappingURL=Button.js.map