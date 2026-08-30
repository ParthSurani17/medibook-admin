import type { ElementType, ReactNode } from "react";
import type { IconType } from "react-icons";

const VARIANTS = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-soft",
  secondary: "bg-mint-500 text-white hover:bg-mint-600 shadow-soft",
  outline: "bg-white text-primary-700 border border-primary-200 hover:bg-primary-50",
  ghost: "bg-transparent text-ink-600 hover:bg-ink-100",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
} as const;

const SIZES = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

interface ButtonOwnProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
  iconPosition?: "left" | "right";
  className?: string;
  as?: ElementType;
}

// Allow any extra props (to, href, type, onClick, disabled, ...) since this
// component is used both as a plain <button> and, via `as={Link}`, as a
// react-router <Link> — the exact prop set depends on `as`.
export type ButtonProps = ButtonOwnProps & Record<string, any>;

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  as: Component = "button",
  ...props
}: ButtonProps) {
  return (
    <Component
      className={`btn-focus inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="text-base" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="text-base" />}
    </Component>
  );
}
