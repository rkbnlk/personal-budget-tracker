import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { post, saveToken } from "@/lib/api";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already signed in, navigate to dashboard
    const token = localStorage.getItem("bt_access_token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const data = await post("/api/auth/login", { email, password });
        saveToken(data.accessToken);
        toast.success("Signed in");
        navigate("/dashboard");
      } else {
        const data = await post("/api/auth/signup", { email, password });
        saveToken(data.accessToken);
        toast.success("Account created");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      const message = err?.message || err?.error || "Authentication failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Wallet className="w-10 h-10 text-primary animate-glow-pulse" />
              <h1 className="text-4xl font-bold gradient-text">BudgetFlow</h1>
            </div>
            <p className="text-muted-foreground">
              {isLogin ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                type="email"
                required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-input border-border/50"
            />
          </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
            <Input
                id="password"
              type="password"
                required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="bg-input border-border/50"
            />
          </div>

            <Button
              type="submit"
              className="w-full btn-glow"
              disabled={loading}
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
