import type { ReactNode } from "react";

type CardProps = {
    children: ReactNode;
    className?: string;
};

export function Card({ children, className = "" }: CardProps) {
    return (
        <section className={`rounded-2xl bg-white p-6 shadow ${className}`}>
            {children}
        </section>
    );
}
