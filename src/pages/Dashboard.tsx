import { useState } from 'react';
import { supabase } from '../lib/supabase';
import OrgDirectory from '../components/OrgDirectory';
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
    <div className="flex h-screen w-screen bg-slate-900 font-sans text-slate-100 overflow-hidden">
      
      {/* SIDEBAR PANEL */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-slate-950">Ω</div>
            <span className="text-lg font-bold tracking-tight text-white">TenantOS</span>
          </div>
          
          <nav className="space-y-1">
            <button 
              onClick={() => { setActiveTab('directory'); setSelectedOrgId(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'directory' ? 'bg-slate-900 text-emerald-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>📁</span> <span>Directory</span>
            </button>
            <button 
              onClick={() => { setActiveTab('create'); setSelectedOrgId(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'create' ? 'bg-slate-900 text-emerald-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>➕</span> <span>New Tenant</span>
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="text-xs text-slate-500">
            Authenticated Admin:<br />
            <span className="text-slate-300 font-mono block truncate mt-1">{session.user.email}</span>
          </div>
          <button onClick={handleSignOut} className="w-full text-center text-xs bg-slate-900 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-medium py-2 rounded-md border border-slate-800 hover:border-red-900/50 transition-all cursor-pointer">
            Sign Out Session ↩
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold text-white tracking-tight">
            {activeTab === 'directory' ? 'Organization Registry' : 'Tenant Provisioning Window'}
          </h1>
          <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 font-medium">
            SaaS Root Account
          </div>
        </header>

        <div className="p-8 max-w-5xl w-full space-y-6">
          {selectedOrgId ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <button onClick={() => setSelectedOrgId(null)} className="text-xs text-emerald-400 hover:underline mb-4 block">← Back to Directory</button>
              <h3 className="text-lg font-bold text-white mb-2">Organization Detail View</h3>
              <p className="text-sm text-slate-400">Selected Org ID Token: <span className="font-mono text-emerald-400">{selectedOrgId}</span></p>
              <div className="mt-6 p-4 border border-dashed border-slate-700 rounded-lg text-sm text-slate-500">
                Milestone 3 Core Placeholder: Member lists and Deno Cloud Edge Function Invitation interfaces will embed here.
              </div>
            </div>
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