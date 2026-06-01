import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}>;

export function Card({ title, subtitle, action, children }: Props) {
  return (
    <section className="card">
      {(title || subtitle || action) && (
        <header className="card-head">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
