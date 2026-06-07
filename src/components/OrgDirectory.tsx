import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export default function OrgDirectory({ onSelectOrg }: { onSelectOrg: (id: string) => void }) {
  
  // Fetching via TanStack React Query instead of raw useEffect
  const { data: orgs, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return <div className="text-sm text-slate-400 animate-pulse">Querying cloud registry database...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400">Failed to load directory items: {(error as any).message}</div>;
  }

  if (orgs?.length === 0) {
    return (
      <div className="border border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-900/30">
        <span className="text-2xl block mb-2">🏢</span>
        <h4 className="text-sm font-medium text-slate-300">No Managed Organizations</h4>
        <p className="text-xs text-slate-500 mt-1">Click 'New Tenant' on the sidebar to deploy your first organization matrix.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold text-slate-400 tracking-wider">
            <th className="p-4">NAME</th>
            <th className="p-4">TYPE</th>
            <th className="p-4">SPECIFIC IDENTIFIER</th>
            <th className="p-4">CREATED AT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
          {orgs?.map((org) => (
            <tr 
              key={org.id} 
              onClick={() => onSelectOrg(org.id)}
              className="hover:bg-slate-900/50 cursor-pointer transition-colors group"
            >
              <td className="p-4 font-medium text-white group-hover:text-emerald-400 transition-colors">{org.name}</td>
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  org.type === 'School' ? 'bg-blue-950/40 text-blue-400 border-blue-900/60' :
                  org.type === 'Nonprofit' ? 'bg-purple-950/40 text-purple-400 border-purple-900/60' :
                  'bg-amber-950/40 text-amber-400 border-amber-900/60'
                }`}>
                  {org.type}
                </span>
              </td>
              <td className="p-4 font-mono text-xs text-slate-400">{org.type_specific_field || 'N/A'}</td>
              <td className="p-4 text-xs text-slate-500">{new Date(org.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}