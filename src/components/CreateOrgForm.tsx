import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const orgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters.'),
  type: z.enum(['School', 'Nonprofit', 'Business'], {
    message: 'Please select a valid type.' ,
  }),
  metadata: z.string().min(2, 'This field is required for your organization type.'),
});

type OrgFormValues = z.infer<typeof orgSchema>;

export default function CreateOrgForm({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: '', type: 'Business', metadata: '' }
  });

  // Watch the organization type to dynamically change the conditional field label
  const selectedType = watch('type');

  // TanStack React Query Mutation for creating an organization
  const mutation = useMutation({
    mutationFn: async (values: OrgFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated admin found.');

      const { error } = await supabase.from('organizations').insert({
        name: values.name,
        type: values.type,
        created_by: user.id,
        // Storing the conditional field details inside a metadata text field or json
        type_specific_field: values.metadata 
      });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate cache instantly so Directory updates automatically without page reload
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      reset();
      setActiveTab('directory');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create organization.');
    }
  });

  return (
    <div className="max-w-xl bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-white mb-4">Register New Sub-Tenant</h3>
      
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        {errorMsg && <div className="rounded-md bg-red-900/40 p-3 text-sm text-red-400 border border-red-800/60">{errorMsg}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-300">Organization Name</label>
          <input type="text" {...register('name')} className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Organization Type</label>
          <select {...register('type')} className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none">
            <option value="Business">Business</option>
            <option value="School">School</option>
            <option value="Nonprofit">Nonprofit</option>
          </select>
        </div>

        {/* 🌟 Dynamic Conditional Form Input Field */}
        <div>
          <label className="block text-sm font-medium text-slate-300">
            {selectedType === 'School' && 'School District Registry Name'}
            {selectedType === 'Nonprofit' && 'Tax-Exempt ID (501c3)'}
            {selectedType === 'Business' && 'Corporate Registration Number (EIN)'}
          </label>
          <input type="text" {...register('metadata')} placeholder={selectedType === 'School' ? 'e.g., District 40' : 'e.g., 12-345678'} className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          {errors.metadata && <p className="mt-1 text-xs text-red-400">{errors.metadata.message}</p>}
        </div>

        <button type="submit" disabled={mutation.isPending} className="w-full rounded-lg bg-emerald-500 p-2.5 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors cursor-pointer">
          {mutation.isPending ? 'Provisioning...' : 'Build Tenant Organization'}
        </button>
      </form>
    </div>
  );
}