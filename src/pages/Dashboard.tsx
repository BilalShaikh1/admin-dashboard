import { supabase } from '../lib/supabase';

interface DashboardProps {
  session: {
    user: {
      email: string;
    };
  };
}

export default function Dashboard({ session }: DashboardProps) {
  
  const handleSignOut = async () => {
    // Drops the auth session token. 
    // App.tsx onAuthStateChange instantly notices and bounces the window back to /signup
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 font-sans text-slate-100 overflow-hidden">
      
      {/* 1. SIDEBAR CONTAINER */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-6">
        <div className="space-y-6">
          {/* Platform Branding Badge */}
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-slate-950">
              Ω
            </div>
            <span className="text-lg font-bold tracking-tight text-white">TenantOS</span>
          </div>
          
          {/* Navigation Tracks */}
          <nav className="space-y-1">
            <a href="#/dashboard" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-slate-900 text-emerald-400 font-medium text-sm transition-colors">
              <span className="text-base">📁</span>
              <span>Directory</span>
            </a>
            <a href="#/dashboard/create" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 font-medium text-sm transition-colors">
              <span className="text-base">➕</span>
              <span>New Tenant</span>
            </a>
          </nav>
        </div>

        {/* Admin Session Core Information Panel */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="text-xs text-slate-500">
            Authenticated Admin:<br />
            <span className="text-slate-300 font-mono font-medium block truncate mt-1" title={session.user.email}>
              {session.user.email}
            </span>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full text-center text-xs bg-slate-900 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-medium py-2 rounded-md border border-slate-800 hover:border-red-900/50 transition-all cursor-pointer"
          >
            Sign Out Session ↩
          </button>
        </div>
      </aside>

      {/* 2. MAIN APP CANVAS INTERFACE */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Dynamic Workspace Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold text-white tracking-tight">Organization Registry</h1>
          <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 font-medium tracking-wide uppercase">
            SaaS Root Account
          </div>
        </header>

        {/* Main View Area Slot */}
        <div className="p-8 max-w-5xl w-full space-y-6">
          
          {/* Quick Informational Workspace Alert Card */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-850 border border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-white mb-1">Architecture Initialization Complete</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              React Router v6 and your global Query Cache Client are securely routing application operations. In the next development iteration, we will implement multi-tenant directory views inside this content window container using TanStack React Query hooks.
            </p>
          </div>

          {/* Placeholders representing directory statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-900/30">
              <span className="text-2xl mb-2">🏢</span>
              <h4 className="text-sm font-medium text-slate-300">Managed Sub-Tenants</h4>
              <p className="text-xs text-slate-500 mt-1">Pending live compilation via React Query hook queries.</p>
            </div>
            <div className="border border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-900/30">
              <span className="text-2xl mb-2">✉️</span>
              <h4 className="text-sm font-medium text-slate-300">Active Email Invitations</h4>
              <p className="text-xs text-slate-500 mt-1">Pending system linking through Deno cloud edge workers.</p>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}