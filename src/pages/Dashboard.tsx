import { useState } from 'react';
import { supabase } from '../lib/supabase';
import OrgDirectory from '../components/OrgDirectory';
import OrgDetails from '../components/OrgDetails';
import CreateOrgForm from '../components/CreateOrgForm';

interface DashboardProps {
  session: {
    user: {
      email: string;
    };
  };
}

export default function Dashboard({ session }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('directory');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-900 font-sans text-slate-100 overflow-hidden">
      
      {/* MOBILE HEADER BAR (Only visible on small viewports) */}
      <header className="flex md:hidden h-14 bg-slate-950 border-b border-slate-800 items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-slate-950">Ω</div>
          <span className="text-sm font-bold tracking-tight text-white">TenantOS</span>
        </div>
        <div className="text-[10px] bg-slate-800 px-2 py-1 rounded-full border border-slate-700 text-slate-300">
          SaaS Root
        </div>
      </header>

      {/* RESPONSIVE PANEL (Sidebar on Desktop, Bottom Control Dock on Mobile) */}
      <aside className="w-full md:w-64 bg-slate-950 border-t md:border-t-0 md:border-r border-slate-800 flex flex-row md:flex-col justify-between p-3 md:p-6 shrink-0 order-last md:order-first z-50 shadow-2xl md:shadow-none">
        <div className="flex md:flex-col justify-around md:justify-start w-full md:space-y-6">
          <div className="hidden md:flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-slate-950">Ω</div>
            <span className="text-lg font-bold tracking-tight text-white">TenantOS</span>
          </div>
          
          <nav className="flex flex-row md:flex-col w-full justify-around md:justify-start md:space-y-1 gap-1">
            <button 
              onClick={() => { setActiveTab('directory'); setSelectedOrgId(null); }}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'directory' ? 'bg-slate-900 text-emerald-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>📁</span> <span className="hidden sm:inline md:inline">Directory</span>
            </button>
            <button 
              onClick={() => { setActiveTab('create'); setSelectedOrgId(null); }}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'create' ? 'bg-slate-900 text-emerald-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>➕</span> <span className="hidden sm:inline md:inline">New Tenant</span>
            </button>
          </nav>
        </div>

        {/* ADMIN PROFILE/SIGN OUT FRAME */}
        <div className="hidden md:block border-t border-slate-800 pt-4 space-y-3">
          <div className="text-xs text-slate-500">
            Authenticated Admin:<br />
            <span className="text-slate-300 font-mono block truncate mt-1">{session?.user?.email || 'Admin'}</span>
          </div>
          <button onClick={handleSignOut} className="w-full text-center text-xs bg-slate-900 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-medium py-2 rounded-md border border-slate-800 hover:border-red-900/50 transition-all cursor-pointer">
            Sign Out Session ↩
          </button>
        </div>
        
        {/* Mobile Sign Out Button Trigger */}
        <div className="flex md:hidden items-center justify-center px-2">
          <button onClick={handleSignOut} className="text-red-400 p-2 text-sm bg-slate-900 rounded-lg border border-slate-800 active:bg-red-950/40">
            🚪
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
        <header className="hidden md:flex h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold text-white tracking-tight">
            {activeTab === 'directory' ? 'Organization Registry' : 'Tenant Provisioning Window'}
          </h1>
          <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 font-medium">
            SaaS Root Account
          </div>
        </header>

        {/* Fluid Container Width padding adaptation */}
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl w-full space-y-6 mx-auto">
          {selectedOrgId ? (
            <OrgDetails orgId={selectedOrgId} onBack={() => setSelectedOrgId(null)} />
          ) : (
            <>
              {activeTab === 'directory' && <OrgDirectory onSelectOrg={(id) => setSelectedOrgId(id)} />}
              {activeTab === 'create' && <CreateOrgForm setActiveTab={setActiveTab} />}
            </>
          )}
        </div>
      </main>

    </div>
  );
}