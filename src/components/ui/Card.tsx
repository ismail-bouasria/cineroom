import { HTMLAttributes, forwardRef, ReactNode } from "react";

type CardVariant = "default" | "bordered" | "elevated";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  hoverable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-slate-800/50 border-transparent",
  bordered: "bg-slate-800/30 border-slate-700",
  elevated: "bg-slate-800 border-slate-700 shadow-xl",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "none",
      hover = false,
      hoverable = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isHoverable = hover || hoverable;
    return (
      <div
        ref={ref}
        className={`
          rounded-xl border backdrop-blur-sm
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${isHoverable ? "transition-all hover:border-violet-600/50 hover:shadow-lg hover:shadow-violet-900/20" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Sub-components
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ 
  className = "", 
  title,
  icon,
  action,
  children, 
  ...props 
}: CardHeaderProps) {
  if (children) {
    return (
      <div className={`p-6 pb-0 ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={`p-6 pb-4 flex items-center justify-between ${className}`} {...props}>
      <div className="flex items-center gap-3">
        {icon}
        {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
      </div>
      {action}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 border-t border-slate-700 ${className}`} {...props}>
      {children}
    </div>
  );
}
