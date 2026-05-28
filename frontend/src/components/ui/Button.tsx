import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: "primary" | "secondary" | "danger";
};

const variantClasses = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger: "border border-red-300 text-red-700 hover:bg-red-50",
};

export function Button({
    children,
    variant = "primary",
    className = "",
    ...props
}: ButtonProps) {
    return (
        <button
            className={`rounded-lg px-4 py-2 font-medium disabled:opacity-60 ${variantClasses[variant]} ${className}`}
            {...props}
            >
            {children}
        </button>
    );
}
