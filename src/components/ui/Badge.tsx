import type { ReservationStatus } from "@/types";

// ============================================
// BADGE GÉNÉRIQUE
// ============================================

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "error" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-700 text-slate-300",
  primary: "bg-violet-600/20 text-violet-400",
  success: "bg-green-600/20 text-green-400",
  warning: "bg-amber-600/20 text-amber-400",
  danger: "bg-rose-600/20 text-rose-400",
  error: "bg-rose-600/20 text-rose-400",
  info: "bg-blue-600/20 text-blue-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  variant = "default",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// ============================================
// STATUS BADGE
// ============================================

const statusConfig: Record<ReservationStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "En attente", variant: "warning" },
  confirmed: { label: "Confirmée", variant: "success" },
  cancelled: { label: "Annulée", variant: "error" },
  completed: { label: "Terminée", variant: "default" },
};

interface StatusBadgeProps {
  status: ReservationStatus;
  size?: BadgeSize;
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

// ============================================
// AVAILABILITY BADGE
// ============================================

interface AvailabilityBadgeProps {
  isAvailable: boolean;
  size?: BadgeSize;
}

export function AvailabilityBadge({ isAvailable, size = "md" }: AvailabilityBadgeProps) {
  return (
    <Badge variant={isAvailable ? "success" : "danger"} size={size}>
      {isAvailable ? "Disponible" : "Indisponible"}
    </Badge>
  );
}
