import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: React.ComponentType<{className?: string}> }) {
  return (
    <div className="mb-8 flex items-start gap-4">
      {Icon && (
        <div className="size-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow shrink-0">
          <Icon className="size-6 text-primary-foreground" />
        </div>
      )}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-gradient-card border border-border rounded-2xl p-6 shadow-card ${className}`}>{children}</div>;
}

export function Btn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`bg-gradient-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl shadow-glow hover:opacity-95 disabled:opacity-50 transition ${props.className||""}`}>
      {children}
    </button>
  );
}

export function GhostBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`glass px-4 py-2 rounded-xl text-sm hover:bg-muted ${props.className||""}`}>{props.children}</button>;
}
