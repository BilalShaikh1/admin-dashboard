import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }: { data: { session: any } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, currentSession: any) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-emerald-400 font-medium animate-pulse">Loading dashboard environment...</div>
      </div>
    );
  }

  return session ? <Dashboard session={session} /> : <SignUp />;
}