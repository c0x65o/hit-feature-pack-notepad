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
export declare function FormInput({ label, error, helpText, className, ...props }: FormInputProps): import("react/jsx-runtime").JSX.Element;
export declare function FormTextArea({ label, error, helpText, className, ...props }: FormTextAreaProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FormInput.d.ts.map