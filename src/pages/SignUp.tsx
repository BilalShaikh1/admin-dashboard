import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  // 1. Core form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');

  // 2. UI Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Manual Validation Check
    if (!orgType) {
      setErrorMsg('Please select a valid organization type.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      // Step A: Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Authentication failed. Please try again.');

      // Step B: Insert the organization details into your database table
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          type: orgType,
          created_by: authData.user.id, // Links the organization to this admin's ID
        });

      if (orgError) throw orgError;

      setSuccessMsg('Account created successfully! Please check your email for a verification link.');
      
      // Clear form inputs on success
      setEmail('');
      setPassword('');
      setOrgName('');
      setOrgType('');
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
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            Create Your Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Register as an Organization Administrator
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message Alert Banner */}
          {errorMsg && (
            <div className="rounded-md bg-red-900/40 p-3 text-sm text-red-400 border border-red-800/60">
              {errorMsg}
            </div>
          )}

          {/* Success Message Alert Banner */}
          {successMsg && (
            <div className="rounded-md bg-emerald-900/40 p-3 text-sm text-emerald-400 border border-emerald-800/60">
              {successMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">Business Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors" 
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors" 
                placeholder="Minimum 8 characters"
                required
              />
            </div>

            <hr className="border-slate-700 my-4" />

            <div>
              <label className="block text-sm font-medium text-slate-300">Organization Name</label>
              <input 
                type="text" 
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors" 
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Organization Type</label>
              <select 
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select a category</option>
                <option value="School">School</option>
                <option value="Nonprofit">Nonprofit</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Registering Account...' : 'Get Started Now'}
          </button>
        </form>
      </div>
    </div>
  );
}