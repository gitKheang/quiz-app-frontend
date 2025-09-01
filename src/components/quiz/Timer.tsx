// Timer component with drift compensation

import { useEffect, useState, useCallback, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  endAt: string;
  serverNow: string;
  onTimeUp?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Timer({
  endAt,
  serverNow,
  onTimeUp,
  className,
  size = "md",
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLowTime, setIsLowTime] = useState(false);
  const [isCriticalTime, setIsCriticalTime] = useState(false);

  // Compute server drift ONCE per session (or when serverNow changes)
  const driftRef = useRef<number>(0);
  useEffect(() => {
    const serverTime = new Date(serverNow).getTime();
    const serverInvalid = Number.isNaN(serverTime);
    const localTime = Date.now();
    driftRef.current = serverInvalid ? 0 : localTime - serverTime;
  }, [serverNow]);

  // Robust remaining-time calculation using cached drift
  const calculateTimeRemaining = useCallback(() => {
    const endTime = new Date(endAt).getTime();
    if (Number.isNaN(endTime)) return 0;

    const estimatedServerTime = Date.now() - driftRef.current;
    const remaining = Math.max(
      0,
      Math.floor((endTime - estimatedServerTime) / 1000)
    );
    return remaining;
  }, [endAt]);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Warning states
      setIsLowTime(remaining <= 300 && remaining > 60); // 5 minutes
      setIsCriticalTime(remaining <= 60); // 1 minute

      if (remaining === 0) {
        onTimeUp?.();
      }
    };

    // Initial calculation
    updateTimer();

    // Update every 500ms for smooth countdown
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [calculateTimeRemaining, onTimeUp]);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-1.5",
    lg: "text-lg px-4 py-2",
  };

  const iconSizes = { sm: 14, md: 16, lg: 18 };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl font-mono font-semibold transition-all duration-300",
        isCriticalTime
          ? "bg-destructive text-destructive-foreground animate-quiz-pulse"
          : isLowTime
          ? "bg-warning text-warning-foreground"
          : "bg-card text-card-foreground border border-border",
        sizeClasses[size],
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
    >
      {isCriticalTime ? (
        <AlertTriangle size={iconSizes[size]} className="animate-quiz-bounce" />
      ) : (
        <Clock size={iconSizes[size]} />
      )}

      <span
        className={cn("tabular-nums", isCriticalTime && "animate-quiz-shake")}
      >
        {formatTime(timeRemaining)}
      </span>

      {/* Screen reader announcements for accessibility */}
      {isLowTime && !isCriticalTime && (
        <span className="sr-only">Warning: 5 minutes remaining</span>
      )}
      {isCriticalTime && (
        <span className="sr-only">Critical: Less than 1 minute remaining</span>
      )}
    </div>
  );
}
