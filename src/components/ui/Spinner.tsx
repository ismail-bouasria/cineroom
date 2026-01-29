import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <Loader2 className={`animate-spin text-red-600 ${sizeStyles[size]} ${className}`} />
  );
}

export function FullPageLoader({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
      <Spinner size="lg" />
      <p className="mt-4 text-slate-400">{message}</p>
    </div>
  );
}

// Skeleton Loader
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-700 rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
