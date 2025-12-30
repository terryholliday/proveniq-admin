"use client";

interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
    return (
        <header className="header">
            <div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{title}</h1>
                {subtitle && (
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: 2 }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
        </header>
    );
}
