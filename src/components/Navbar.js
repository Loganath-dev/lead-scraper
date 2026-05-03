'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';
import { Wallet, LogOut, User as UserIcon, Zap } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const pathname = usePathname();



  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
  }

  if (pathname === '/dashboard') return null;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200">
                L
              </div>
              <span className="font-heading text-2xl tracking-tight text-slate-900">LeadSnap</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {!user && (
              <>
                <Link href="/#features" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Features</Link>
                <Link href="/#pricing" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Pricing</Link>
                <Link href="/blog" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Blog</Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                  <Zap size={16} className="text-emerald-500 fill-emerald-500" />
                  <span className="text-sm font-bold text-emerald-700">{profile?.credits_remaining ?? 0} Credits</span>
                </div>
                <Link href="/dashboard" className="btn btn-primary py-2 px-4 text-sm inline-block">
                  Dashboard
                </Link>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 font-semibold hover:text-slate-900">Sign In</Link>
                <Link href="/signup" className="btn btn-primary py-2 px-6 shadow-xl shadow-emerald-100 inline-block">
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Light glass style applied via .glass class in globals.css */}
    </nav>
  );
}
