'use client';

import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, footer, className = '' }: CardProps) {
  return (
    <div className={`bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-[var(--hit-border)]">
          {title && <h3 className="text-lg font-semibold text-[var(--hit-foreground)]">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-[var(--hit-muted-foreground)]">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-[var(--hit-border)] bg-[var(--hit-muted)]">
          {footer}
        </div>
      )}
    </div>
  );
}
