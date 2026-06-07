import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabase';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard.tsx';

// 🔒 Protected Layout Guard Component
function ProtectedRoute({ session, loading }: { session: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />
      </div>
    );
  }

  // If no active auth token exists, securely redirect to signup page
  return session ? <Outlet /> : <Navigate to="/signup" replace />;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state alterations
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Access Points */}
        <Route 
          path="/signup" 
          element={session ? <Navigate to="/dashboard" replace /> : <SignUp />} 
        />
        
        {/* Fallback routing for standard access paths */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 🛡️ Secure Gateways */}
        <Route element={<ProtectedRoute session={session} loading={loading} />}>
          <Route path="/dashboard" element={<Dashboard session={session} />} />
          {/* Future nested child routes like /dashboard/org/:id will go here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}