import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, id, className = "", ...props }: Props) {
  return (
    <label className={`field${className ? ` ${className}` : ""}`} htmlFor={id}>
      {label ? <span className="field-label">{label}</span> : null}
      <input id={id} {...props} className="input" />
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
