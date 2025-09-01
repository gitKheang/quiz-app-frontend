
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning";
}

export function ProgressBar({
  current,
  total,
  showText = true,
  className,
  size = "md",
  variant = "default",
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / total) * 100));

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showText && (
        <div className="flex justify-between items-center">
          <span
            className={cn("font-medium text-foreground", textSizeClasses[size])}
          >
            Progress
          </span>
          <span
            className={cn(
              "font-mono font-semibold text-muted-foreground",
              textSizeClasses[size]
            )}
          >
            {current}/{total}
          </span>
        </div>
      )}

      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn(
            "rounded-full transition-colors duration-300",
            sizeClasses[size],
            variantClasses[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`Progress: ${current} of ${total} completed`}
        />
      </div>

      {showText && (
        <div
          className={cn(
            "text-right text-muted-foreground",
            textSizeClasses[size]
          )}
        >
          {percentage.toFixed(0)}% complete
        </div>
      )}
    </div>
  );
}
