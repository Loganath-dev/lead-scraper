'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Zap, ExternalLink, Download, Filter, Share2, Copy, CheckCircle2, BookOpen, LogOut, Plus, ChevronDown, ChevronUp, Star, X, Bookmark, Mail, Phone, Globe, BarChart3, Shield, Bell, ArrowUpCircle, Home, Settings, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BeginnerGuides from '@/components/BeginnerGuides';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRICING } from '@/data/pricing';

function OpportunityRing({ score }) {
  const r = 18, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#94a3b8';
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function MetricBadge({ label, value, good }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${good ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
      {good ? <CheckCircle2 size={12} /> : <X size={12} />} {label}{value !== undefined ? `: ${value}` : ''}
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState({ query: '', location: '', count: 50 });
  const [leads, setLeads] = useState([]);
  const [savedLeads, setSavedLeads] = useState([]);
  const [savedPlaceIds, setSavedPlaceIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState('leads');
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const fetchSavedLeads = useCallback(async (uid) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/leads/save`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (data.leads) {
        setSavedLeads(data.leads);
        setSavedPlaceIds(new Set(data.leads.map(l => l.placeId)));
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    fetchProfile(user.id);
    fetchSavedLeads(user.id);

    const channelName = `profile-${user.id}`;
    
    // Safety cleanup: Ensure no lingering channels from strict mode reloading
    const existing = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
    if (existing) supabase.removeChannel(existing);

    const profileSubscription = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `id=eq.${user.id}` 
      }, (payload) => {
        setProfile(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [user?.id, fetchSavedLeads]);



  async function fetchProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
    } else if (error && error.code === 'PGRST116') {
      // Profile missing (e.g. user created before trigger) -> Auto-create
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert([{ id: userId, email: user?.email || '', subscription_tier: 'free', credits_remaining: 80 }])
        .select()
        .single();
      if (newProfile) setProfile(newProfile);
    }
    fetchSavedLeads(userId);
  }

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setExpandedIdx(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ ...search })
      });
      const data = await res.json();
      if (data.error) { alert(data.error); }
      else if (data.leads) { setLeads(data.leads); if (user) fetchProfile(user.id); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (lead) => {
    if (!user) return;
    setSavingId(lead.placeId);
    const isSaved = savedPlaceIds.has(lead.placeId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      };

      if (isSaved) {
        await fetch('/api/leads/save', { method: 'DELETE', headers, body: JSON.stringify({ placeId: lead.placeId }) });
      } else {
        await fetch('/api/leads/save', { method: 'POST', headers, body: JSON.stringify({ lead }) });
      }
      await fetchSavedLeads(user.id);
    } catch (e) { console.error(e); }
    finally { setSavingId(null); }
  };

  const handleExportCSV = () => {
    const data = (view === 'saved' ? savedLeads : filteredLeads);
    if (!data.length) return;
    const headers = ['Name','Address','Phone','Email','Website','Rating','Reviews','Score','Priority'];
    const rows = data.map(l => [l.name, l.address, l.phone, l.email||'', l.website||'', l.rating, l.reviews, l.opportunityScore, l.priority]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leadsnap_leads.csv'; a.click();
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`https://leadsnap.app/signup?ref=${user?.id}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareUrl = `https://leadsnap.app/signup?ref=${user?.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join LeadSnap',
          text: 'Find high-quality leads and grow your freelance business with LeadSnap!',
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyReferral();
    }
  };

  const displayLeads = (view === 'saved' ? savedLeads : leads)
    .sort((a, b) => (b.opportunityScore || b.score || 0) - (a.opportunityScore || a.score || 0));
  const isPaid = profile?.subscription_tier === 'starter' || profile?.subscription_tier === 'pro';

  const renderLeadRow = (lead, idx) => {
    const isExpanded = expandedIdx === `${view}-${idx}`;
    const isSaved = savedPlaceIds.has(lead.placeId);
    return (
      <motion.div key={`${lead.placeId}-${idx}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
        <div className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 ${isExpanded ? 'bg-slate-50' : ''}`} onClick={() => setExpandedIdx(isExpanded ? null : `${view}-${idx}`)}>
          <button onClick={(e) => { e.stopPropagation(); handleSave(lead); }} disabled={savingId === lead.placeId} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${isSaved ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-400 hover:text-emerald-500 border border-slate-200 hover:border-emerald-200'}`}>
            {isSaved ? <Bookmark size={14} className="fill-current" /> : <Bookmark size={14} />}
          </button>

          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-emerald-500 hover:text-emerald-600"><ExternalLink size={14} /></a>}
            {lead.priority === 'HIGH' && isPaid && <Shield size={14} className="text-amber-500" title="High Priority" />}
            <span className="font-bold text-slate-800 truncate">{lead.name}</span>
          </div>

          <div className="text-slate-400">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>

          <div className="hidden md:flex items-center gap-1.5 w-[180px] truncate">
            {lead.email ? <span className="text-sm text-slate-600 truncate">{lead.email}</span> : <span className="text-sm text-slate-300">—</span>}
          </div>

          <div className="hidden md:block w-[130px] text-sm text-slate-600 font-medium">{lead.phone || 'N/A'}</div>

          <div className="hidden lg:flex items-center gap-1 w-[60px]">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-slate-700">{lead.rating || '—'}</span>
          </div>

          <div className="hidden lg:block w-[70px] text-sm text-slate-500 font-medium text-right">{lead.reviews || 0}</div>

          <div className="shrink-0"><OpportunityRing score={lead.opportunityScore || lead.score || 0} /></div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-slate-100">
              <div className="px-5 py-4 bg-slate-50/60">
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><MapPin size={13} /> {lead.address}</span>
                  {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-500"><Globe size={13} /> {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>}
                  {lead.email && <span className="flex items-center gap-1.5"><Mail size={13} /> {lead.email}</span>}
                  {lead.phone !== 'N/A' && <span className="flex items-center gap-1.5"><Phone size={13} /> {lead.phone}</span>}
                </div>
                {!lead.website && <p className="text-sm text-amber-600 mb-4 font-medium italic">This business has no website — high opportunity for web design services.</p>}
                {lead.metrics && (
                  <div className="flex flex-wrap items-center gap-2">
                    <MetricBadge label="SEO" value={lead.metrics.seoScore} good={lead.metrics.seoScore >= 50} />
                    <MetricBadge label="Performance" value={lead.metrics.performanceScore} good={lead.metrics.performanceScore >= 50} />
                    <MetricBadge label="HTTPS" good={lead.metrics.hasHttps} />
                    <MetricBadge label="Contact" good={lead.metrics.hasContactPage} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200">
              {(profile?.full_name || user?.user_metadata?.full_name || user?.email)?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="font-heading text-slate-900 leading-tight truncate max-w-[140px]">
                {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{profile?.subscription_tier || 'Free'} Plan</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credits Left</span>
              <span className="text-sm font-bold text-slate-900">{profile?.credits_remaining ?? 0}</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ 
                width: `${Math.min(((profile?.credits_remaining || 0) / (profile?.subscription_tier === 'pro' ? 6000 : profile?.subscription_tier === 'starter' ? 3000 : 80)) * 100, 100)}%` 
              }}></div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'leads', label: 'Dashboard', icon: <Home size={18} /> },
            { id: 'saved', label: 'Saved Leads', icon: <Bookmark size={18} /> },
            { id: 'guides', label: 'Guides', icon: <BookOpen size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${view === item.id ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
          
          <button
            onClick={() => setView('upgrade')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${view === 'upgrade' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'text-amber-600 hover:bg-amber-50'}`}
          >
            <ArrowUpCircle size={18} /> Upgrade Account
          </button>
        </nav>

        <div className="px-6 pb-6 space-y-6">
          <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-heading text-emerald-700 text-sm flex items-center gap-2">Refer & Earn</h3>
              <button onClick={handleShare} className="p-1.5 text-emerald-500 hover:bg-emerald-100 rounded-lg transition-colors" title="Share Referral Link">
                <Share2 size={16} />
              </button>
            </div>
            <p className="text-[10px] text-emerald-600/70 mb-4 leading-relaxed font-medium">Get 500 bonus credits for every friend you refer.</p>
            <div className="relative">
              <input readOnly value={`leadsnap.app/signup?ref=${user?.id?.slice(0, 8)}`} className="w-full text-[9px] p-2.5 bg-white border border-emerald-100 rounded-xl pr-10 outline-none text-emerald-600 font-bold" />
              <button onClick={copyReferral} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-700 transition-colors">
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>


          
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-heading text-slate-900 mb-2 capitalize">{view === 'leads' ? 'Lead Dashboard' : view.replace('-', ' ')}</h1>
            <p className="text-slate-500 font-medium">
              {view === 'leads' && 'Find and manage your high-opportunity leads.'}
              {view === 'saved' && 'Review your bookmarked opportunities.'}
              {view === 'guides' && 'Learn how to scale your freelance business.'}
              {view === 'upgrade' && 'Choose the plan that fits your growth.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`p-3 border rounded-2xl transition-all relative shadow-sm ${notificationsEnabled ? 'bg-white border-slate-200 text-slate-400 hover:text-emerald-500' : 'bg-slate-100 border-slate-200 text-slate-300'}`}
              title={notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
            >
              <Bell size={22} className={notificationsEnabled ? 'fill-emerald-50' : ''} />
              {notificationsEnabled && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>}
            </button>
            <div className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Zap size={18} className="text-emerald-500 fill-emerald-500" />
              <span className="font-bold text-slate-600">{profile?.credits_remaining ?? 0}</span>
            </div>
          </div>
        </div>

        {view === 'guides' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><BeginnerGuides /></motion.div>
        )}

        {view === 'upgrade' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {PRICING.map((plan, i) => (
                <div key={i} className={`premium-card p-10 flex flex-col relative bg-white border-slate-200 ${plan.popular ? 'ring-4 ring-emerald-50 border-emerald-200' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-heading text-slate-900">{plan.price}</span>
                      <span className="text-slate-400 font-medium">/mo</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">{plan.leads}</p>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`btn w-full py-4 ${plan.premium ? 'btn-primary shadow-xl shadow-emerald-100' : 'btn-outline'}`}>
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}




        {(view === 'leads' || view === 'saved') && (
          <>
            {view === 'leads' && (
              <div className="premium-card p-8 mb-10 bg-white border-slate-200 shadow-xl shadow-slate-200/20">
                <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="What business? (e.g. Dentists)" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-medium" value={search.query} onChange={e => setSearch({...search, query: e.target.value})} />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="Where? (e.g. San Francisco, CA)" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-medium" value={search.location} onChange={e => setSearch({...search, location: e.target.value})} />
                  </div>
                  {isPaid && (
                    <div className="w-full xl:w-48">
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-bold appearance-none cursor-pointer" value={search.count} onChange={e => setSearch({...search, count: parseInt(e.target.value)})}>
                        <option value={20}>20 leads</option>
                        <option value={40}>40 leads</option>
                        <option value={80}>80 leads</option>
                      </select>
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="btn btn-primary px-12 py-4 text-lg">
                    {loading ? 'Searching...' : 'Search Leads'}
                  </button>
                </form>
              </div>
            )}

            <div className="flex flex-col gap-8">
              {(view === 'leads' || view === 'saved') && isPaid && (
                <div className="flex justify-end">
                  <button onClick={handleExportCSV} className="btn btn-outline flex items-center gap-2 px-6 py-2 text-sm bg-white shadow-sm border-slate-200">
                    <Download size={16} /> Export to CSV
                  </button>
                </div>
              )}

              <div className="w-full">
                <div className="premium-card overflow-hidden bg-white border-slate-200 shadow-xl shadow-slate-200/10">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="w-8"></span>
                    <span className="flex-1 min-w-[200px]">Lead Name</span>
                    <span className="w-4"></span>
                    <span className="hidden md:block w-[180px]">Contact Email</span>
                    <span className="hidden md:block w-[130px]">Phone Number</span>
                    <span className="hidden lg:block w-[60px]">Rating</span>
                    <span className="hidden lg:block w-[70px] text-right">Reviews</span>
                    <span className="w-12 text-center">Score</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {displayLeads.map((lead, idx) => renderLeadRow(lead, idx))}
                    </AnimatePresence>
                    {displayLeads.length === 0 && (
                      <div className="p-32 text-center text-slate-400">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          {view === 'saved' ? <Bookmark size={40} className="text-slate-200" /> : <Search size={40} className="text-slate-200" />}
                        </div>
                        <h3 className="text-xl font-heading text-slate-900 mb-2">{view === 'saved' ? 'No saved leads yet.' : 'No search results.'}</h3>
                        <p className="font-medium text-slate-400">{view === 'saved' ? 'Leads you bookmark will appear here.' : 'Enter a query and location to find opportunities.'}</p>
                      </div>
                    )}
                  </div>

                  {displayLeads.length > 0 && (
                    <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500">{displayLeads.length} {view === 'saved' ? 'saved' : ''} leads identified</span>
                      {isPaid && displayLeads.some(l => l.priority === 'HIGH') && (
                        <span className="text-sm font-bold text-amber-500 flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                          <Shield size={14} className="fill-amber-500" /> {displayLeads.filter(l => l.priority === 'HIGH').length} High Priority
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
