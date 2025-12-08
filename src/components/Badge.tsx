'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-[var(--hit-muted)] text-[var(--hit-muted-foreground)]',
  success: 'bg-[var(--hit-success-light)] text-[var(--hit-success-dark)]',
  warning: 'bg-[var(--hit-warning-light)] text-[var(--hit-warning-dark)]',
  error: 'bg-[var(--hit-error-light)] text-[var(--hit-error-dark)]',
  info: 'bg-[var(--hit-info-light)] text-[var(--hit-info-dark)]',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
