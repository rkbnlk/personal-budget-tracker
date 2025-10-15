import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { get, loadToken } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const token = loadToken();
      if (!token) { setAuthenticated(false); return; }
      try {
        await get('/api/auth/me', token);
        setAuthenticated(true);
      } catch (err) {
        console.warn('Session invalid', err);
        setAuthenticated(false);
      }
    };
    check();
  }, []);

  if (authenticated === null) return null; // or a loader
  if (!authenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
