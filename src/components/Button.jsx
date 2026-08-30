const VARIANTS = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 shadow-soft",
  secondary:
    "bg-mint-500 text-white hover:bg-mint-600 shadow-soft",
  outline:
    "bg-white text-primary-700 border border-primary-200 hover:bg-primary-50",
  ghost: "bg-transparent text-ink-600 hover:bg-ink-100",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  as: Component = "button",
  ...props
}) {
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
