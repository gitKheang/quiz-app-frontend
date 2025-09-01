import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarUserProps = {
  avatar?: React.ReactNode;
  name?: string;
  email?: string;
  onLogout?: () => void;
  className?: string;
  actions?: React.ReactNode;
};

const SidebarUser: React.FC<SidebarUserProps> = ({
  avatar,
  name,
  email,
  onLogout,
  className,
  actions,
}) => {
  return (
    <div
      data-sidebar="user"
      className={cn(
        "flex items-center gap-3 rounded-md bg-sidebar-accent/30 p-2 text-sidebar-foreground",
        className
      )}
    >
      {avatar ?? (
        <div className="size-8 rounded-md bg-sidebar-accent/60" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        {name && <div className="truncate text-sm font-medium">{name}</div>}
        {email && (
          <div className="truncate text-xs text-sidebar-foreground/70">
            {email}
          </div>
        )}
      </div>
      {actions ??
        (onLogout && (
          <Button size="sm" variant="ghost" onClick={onLogout}>
            Log out
          </Button>
        ))}
    </div>
  );
};

export { SidebarUser };
