import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';

// 1. Validation Schema
const authSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function SignUp() {
  // 🌟 Toggle between Sign In mode and Sign Up mode
  const [isLogin, setIsLogin] = useState(true); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (values: AuthFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isLogin) {
      // 🔑 LOG IN FLOW
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) setErrorMsg(error.message);
    } else {
      // 📝 SIGN UP FLOW
      const { error, data } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setErrorMsg(error.message);
      } else if (data.user && data.session === null) {
        setSuccessMsg('Registration successful! Please check your email inbox to verify your account.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white text-center">
            {isLogin ? 'Welcome Back' : 'Create Admin Account'}
          </h2>
          <p className="text-xs text-slate-400 text-center mt-1">
            {isLogin ? 'Sign in to manage your tenant clusters' : 'Register a new master administrative profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && <div className="p-3 bg-red-950/40 border border-red-900/60 text-red-400 text-xs rounded-md">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 text-xs rounded-md">{successMsg}</div>}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input type="email" {...register('email')} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="admin@company.com" />
            {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input type="password" {...register('password')} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="••••••••" />
            {errors.password && <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-slate-950 font-semibold p-2.5 rounded-lg text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer">
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Master Profile'}
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); setSuccessMsg(null); }} className="text-xs text-emerald-400 hover:underline cursor-pointer bg-transparent border-none">
            {isLogin ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}