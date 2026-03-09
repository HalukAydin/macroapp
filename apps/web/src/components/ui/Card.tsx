import type { CSSProperties, ReactNode } from "react";

type CardProps = {
  title?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export default function Card({ title, children, style, className }: CardProps) {
  return (
    <section className={["ui-card", className].filter(Boolean).join(" ")} style={style}>
      {title ? <h3 className="ui-card-title">{title}</h3> : null}
      {children}
    </section>
  );
}
