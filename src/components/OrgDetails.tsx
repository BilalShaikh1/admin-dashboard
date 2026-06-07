import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid teammate email address.'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface OrgDetailsProps {
  orgId: string;
  onBack: () => void;
}

export default function OrgDetails({ orgId, onBack }: OrgDetailsProps) {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: org } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('*').eq('id', orgId).single();
      if (error) throw error;
      return data;
    }
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId)
        .order('invited_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema)
  });

  const inviteMutation = useMutation({
    mutationFn: async (values: InviteFormValues) => {
      setFeedback(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Authentication session token expired.');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-member`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ organizationId: orgId, email: values.email })
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Serverless routing error.');
      return result;
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Invitation record added successfully!' });
      reset();
      queryClient.invalidateQueries({ queryKey: ['members', orgId] });
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', message: err.message });
    }
  });

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer bg-transparent border-none">
        ← Return to Registry Directory
      </button>

      <div className="bg-slate-850 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">{org?.type} Cluster</span>
          <h2 className="text-2xl font-bold text-white mt-1">{org?.name}</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">Tenant ID: {orgId}</p>
        </div>
        <div className="bg-slate-900 border border-slate-700/60 px-4 py-2.5 rounded-lg text-xs text-slate-400 font-mono">
          Identifier: <span className="text-slate-200">{org?.type_specific_field || 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900/50 border-b border-slate-800 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-300">Active Roster Directory</h3>
            </div>

            {isLoading ? (
              <div className="p-6 text-sm text-slate-500 animate-pulse">Syncing cluster records...</div>
            ) : members?.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No active members found. Use the invitation frame to add teammates.</div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {members?.map((member: any) => (
                  <div key={member.id} className="p-4 flex items-center justify-between text-sm hover:bg-slate-900/30 transition-colors">
                    <span className="text-slate-200 font-medium">{member.email}</span>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="capitalize text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">{member.role}</span>
                      <span className="px-2.5 py-0.5 rounded-full font-semibold border bg-amber-950/30 text-amber-400 border-amber-900/50 uppercase tracking-wider text-[10px] animate-pulse">
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 self-start">
          <h4 className="text-sm font-bold text-white mb-1">Invite Team Member</h4>
          <p className="text-xs text-slate-400 mb-4">Invites execute server-side via Deno Edge Workers.</p>

          <form onSubmit={handleSubmit((data) => inviteMutation.mutate(data))} className="space-y-3">
            {feedback && (
              <div className={`p-3 rounded-md text-xs border ${
                feedback.type === 'success' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' : 'bg-red-950/40 text-red-400 border-red-900/60'
              }`}>
                {feedback.message}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Teammate Email Address</label>
              <input type="email" {...register('email')} placeholder="name@company.com" className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              {errors.email && <p className="mt-1 text-[11px] text-red-400">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={inviteMutation.isPending} className="w-full rounded-lg bg-emerald-500 p-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors cursor-pointer">
              {inviteMutation.isPending ? 'Processing...' : 'Send Secure Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}