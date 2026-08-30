import type { ElementType, ReactNode } from "react";
import type { IconType } from "react-icons";

interface InputProps {
  label?: string;
  id?: string;
  error?: string;
  className?: string;
  as?: ElementType;
  children?: ReactNode;
  icon?: IconType;
  [key: string]: any;
}

export function Input({
  label,
  id,
  error,
  className = "",
  as = "input",
  children,
  icon: Icon,
  ...props
}: InputProps) {
  const Tag = as;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300">
            <Icon />
          </span>
        )}
        <Tag
          id={id}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink-800 placeholder:text-ink-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 ${
            Icon ? "pl-10" : ""
          } ${error ? "border-red-400 focus:ring-red-100" : "border-ink-200 focus:border-primary-400"}`}
          {...props}
        >
          {children}
        </Tag>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  id?: string;
  error?: string;
  options: SelectOption[];
  className?: string;
  [key: string]: any;
}

export function Select({ label, id, error, options, className = "", ...props }: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 ${
          error ? "border-red-400 focus:ring-red-100" : "border-ink-200 focus:border-primary-400"
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

interface TextAreaProps {
  label?: string;
  id?: string;
  error?: string;
  className?: string;
  [key: string]: any;
}

export function TextArea({ label, id, error, className = "", ...props }: TextAreaProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink-800 placeholder:text-ink-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 ${
          error ? "border-red-400 focus:ring-red-100" : "border-ink-200 focus:border-primary-400"
        }`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
