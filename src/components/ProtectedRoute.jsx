import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg font-medium text-slate-600">
          Checking authentication...
        </p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export { ProtectedRoute };
