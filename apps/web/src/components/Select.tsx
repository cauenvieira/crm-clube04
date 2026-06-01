import type { SelectHTMLAttributes } from "react";

type Option = {
  value: string;
  label: string;
};

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  options: Option[];
};

export function Select({ label, hint, error, id, options, className = "", ...props }: Props) {
  return (
    <label className={`field${className ? ` ${className}` : ""}`} htmlFor={id}>
      {label ? <span className="field-label">{label}</span> : null}
      <select id={id} {...props} className="input">
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
