import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

// 📋 Strict Type Validation Schema using Zod
const signupSchema = z.object({
  email: z.string().email('Please enter a valid business email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  orgName: z.string().min(2, 'Organization name must be at least 2 characters.'),
  orgType: z.enum(['School', 'Nonprofit', 'Business'], {
  message: 'Please select a valid organization type',
}),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize form controls with Zod schema verification hooks
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      orgName: '',
      orgType: undefined,
    }
  });

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Step A: Create the admin credential in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Authentication failed. Please try again.');

      // Step B: Insert the relational record mapping the admin to their organization tenant
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: values.orgName,
          type: values.orgType,
          created_by: authData.user.id,
        });

      if (orgError) throw orgError;

      setSuccessMsg('Account created successfully! Bypassing security checks.');
      reset(); // Clear inputs cleanly via react-hook-form hook
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">Create Your Portal</h2>
          <p className="mt-2 text-center text-sm text-slate-400">Register as an Organization Administrator</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {errorMsg && <div className="rounded-md bg-red-900/40 p-3 text-sm text-red-400 border border-red-800/60">{errorMsg}</div>}
          {successMsg && <div className="rounded-md bg-emerald-900/40 p-3 text-sm text-emerald-400 border border-emerald-800/60">{successMsg}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-300">Business Email</label>
            <input type="email" {...register('email')} className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors" />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input type="password" {...register('password')} className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors" placeholder="Minimum 8 characters" />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <hr className="border-slate-700 my-2" />

          <div>
            <label className="block text-sm font-medium text-slate-300">Organization Name</label>
            <input type="text" {...register('orgName')} className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors" />
            {errors.orgName && <p className="mt-1 text-xs text-red-400">{errors.orgName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Organization Type</label>
            <select {...register('orgType')} className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors">
              <option value="">Select a category</option>
              <option value="School">School</option>
              <option value="Nonprofit">Nonprofit</option>
              <option value="Business">Business</option>
            </select>
            {errors.orgType && <p className="mt-1 text-xs text-red-400">{errors.orgType.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50 cursor-pointer">
            {loading ? 'Registering Account...' : 'Get Started Now'}
          </button>
        </form>
      </div>
    </div>
  );
}