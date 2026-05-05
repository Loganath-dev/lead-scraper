'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage({ type = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const referral = searchParams.get('ref');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (type === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }
      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        setError('Password must contain at least one uppercase letter and one number.');
        setLoading(false);
        return;
      }
      if (!acceptedTerms) {
        setError('You must accept the Privacy Policy and Terms and Conditions.');
        setLoading(false);
        return;
      }
    }

    if (type === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Use a generic error message for security to prevent account enumeration
        setError('Invalid login credentials. Please try again.');
      } else {
        router.push('/dashboard');
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
          }
        }
      });
      if (error) {
        setError(error.message);
      } else {
        try {
          fetch('/api/auth/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
        } catch (e) {}
        // Referral logic
        if (referral && data.user) {
          try {
            await supabase.rpc('process_referral', { referrer_id: referral });
          } catch (refErr) {
            console.error('Referral credit error:', refErr);
          }
        }
        setMessage('Check your email for the confirmation link!');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) setError(error.message);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setMessage('Password reset link sent to your email!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div>
            <span className="font-heading text-2xl tracking-tight text-slate-900">LeadSnap</span>
          </Link>
          <h1 className="text-3xl font-heading text-slate-900 mb-2">
            {type === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-500 font-medium">
            {type === 'login' ? 'Enter your details to access your leads.' : 'Join the top 1% of client-closing freelancers.'}
          </p>
        </div>

        <div className="premium-card p-8 bg-white">
          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all mb-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-300 bg-white px-2">Or with email</div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}
            {message && (
              <div className="p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl border border-emerald-100">
                {message}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-bold text-emerald-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {type === 'signup' && (
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-slate-500">
                  I accept the <Link href="/privacy-policy" className="text-emerald-600 hover:underline">Privacy Policy</Link> and <Link href="/terms-and-conditions" className="text-emerald-600 hover:underline">Terms and Conditions</Link>.
                </label>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 shadow-xl shadow-emerald-100">
              {loading ? <Loader2 className="animate-spin" /> : (
                <span className="flex items-center gap-2">
                  {type === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm font-medium">
              {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <Link href={type === 'login' ? '/signup' : '/login'} className="text-emerald-600 font-bold hover:underline">
                {type === 'login' ? 'Sign up for free' : 'Log in here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}