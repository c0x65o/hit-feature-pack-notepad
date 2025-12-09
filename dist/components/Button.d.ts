import React from 'react';
import { LucideIcon } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconRight?: LucideIcon;
    loading?: boolean;
    children: React.ReactNode;
}
export declare function Button({ variant, size, icon: Icon, iconRight: IconRight, loading, disabled, children, className, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Button.d.ts.map