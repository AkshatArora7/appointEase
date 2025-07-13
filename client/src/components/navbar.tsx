import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/");
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <button 
              onClick={() => setLocation("/")}
              className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              BookFlow
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-muted-foreground">Welcome, {user.username}</span>
                <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setLocation("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => setLocation("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
