"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X, Inbox } from "lucide-react";

// ============================================
// ALERT
// ============================================

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const alertConfig: Record<AlertVariant, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
  info: {
    icon: <Info className="w-5 h-5" />,
    bg: "bg-blue-900/30",
    border: "border-blue-700",
    text: "text-blue-300",
  },
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    bg: "bg-green-900/30",
    border: "border-green-700",
    text: "text-green-300",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bg: "bg-amber-900/30",
    border: "border-amber-700",
    text: "text-amber-300",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    bg: "bg-rose-900/30",
    border: "border-rose-700",
    text: "text-rose-300",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  className = "",
}: AlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const config = alertConfig[variant];

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={`
        flex gap-3 p-4 rounded-lg border
        ${config.bg} ${config.border} ${config.text}
        ${className}
      `}
    >
      <div className="shrink-0 mt-0.5">{config.icon}</div>

      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <div className="text-sm opacity-90">{children}</div>
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Fermer l'alerte"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = <Inbox className="w-12 h-12" />,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-slate-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-400 max-w-md mb-6">{description}</p>}
      {action}
    </div>
  );
}
