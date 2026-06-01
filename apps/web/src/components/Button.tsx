import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  }
>;

export function Button({ variant = "primary", fullWidth = false, className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={`btn btn-${variant}${fullWidth ? " btn-full" : ""}${className ? ` ${className}` : ""}`}
    />
  );
}
