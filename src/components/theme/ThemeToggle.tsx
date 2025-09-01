// Theme toggle component

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
}

export function ThemeToggle({
  size = "md",
  variant = "ghost",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const getCurrentIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon size={iconSizes[size]} />;
      case "light":
        return <Sun size={iconSizes[size]} />;
      default:
        return <Monitor size={iconSizes[size]} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "sm"}
          className="quiz-focus"
          aria-label="Toggle theme"
        >
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="gap-2 cursor-pointer"
        >
          <Sun size={16} />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="gap-2 cursor-pointer"
        >
          <Moon size={16} />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="gap-2 cursor-pointer"
        >
          <Monitor size={16} />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
