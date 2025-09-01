import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/lib/auth-client";

export default function AuthButtons() {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuthStore();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">
          Hi, {user.name}
        </span>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
          disabled={loading}
        >
          Log out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost">
        <Link to="/signin">Sign in</Link>
      </Button>
      <Button asChild>
        <Link to="/signup">Sign up</Link>
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          window.location.href = authApi.googleStartUrl();
        }}
      >
        Google
      </Button>
    </div>
  );
}
