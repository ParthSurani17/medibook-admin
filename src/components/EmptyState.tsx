import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import Button from "./Button";

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink-200 bg-ink-50/50 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl text-primary-500 animate-floatSlow">
          <Icon />
        </div>
      )}
      <h3 className="text-lg font-bold text-ink-800">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-500">{message}</p>
      {actionLabel && actionTo && (
        <Button as={Link} to={actionTo} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
