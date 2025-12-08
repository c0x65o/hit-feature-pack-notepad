'use client';

import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export function FormInput({ label, error, helpText, className = '', ...props }: FormInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[var(--hit-foreground)] mb-1.5">
        {label}
        {props.required && <span className="text-[var(--hit-error)] ml-1">*</span>}
      </label>
      <input
        className={`w-full px-4 py-2.5 bg-[var(--hit-input-bg)] border border-[var(--hit-border)] rounded-lg text-[var(--hit-foreground)] placeholder-[var(--hit-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--hit-primary)] focus:border-transparent transition-colors ${error ? 'border-[var(--hit-error)]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[var(--hit-error)]">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-[var(--hit-muted-foreground)]">{helpText}</p>}
    </div>
  );
}

export function FormTextArea({ label, error, helpText, className = '', ...props }: FormTextAreaProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[var(--hit-foreground)] mb-1.5">
        {label}
        {props.required && <span className="text-[var(--hit-error)] ml-1">*</span>}
      </label>
      <textarea
        className={`w-full px-4 py-2.5 bg-[var(--hit-input-bg)] border border-[var(--hit-border)] rounded-lg text-[var(--hit-foreground)] placeholder-[var(--hit-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--hit-primary)] focus:border-transparent transition-colors resize-none ${error ? 'border-[var(--hit-error)]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[var(--hit-error)]">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-[var(--hit-muted-foreground)]">{helpText}</p>}
    </div>
  );
}
