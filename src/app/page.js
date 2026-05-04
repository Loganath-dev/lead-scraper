'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Zap, CheckCircle2, Star, TrendingUp, Users, Share2, BarChart3, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const PRICING = [
  {
    name: "Free",
    price: "$0",
    leads: "100 leads/mo",
    features: [
      "Basic scoring",
      "50 leads per search",
      "2 searches per month",
      "Beginner guides",
    ],
    cta: "Start Free",
    premium: false,
    popular: false,
  },
  {
    name: "Starter",
    price: "$4",
    leads: "1,000 verified leads/mo",
    features: [
      "Everything in Free",
      "CSV export",
      "High Priority Clients",
      "Advanced Metrics",
      "Custom lead count",
      "Beginner guides",
    ],
    cta: "Go Starter",
    premium: true,
    popular: true,
  },
  {
    name: "Pro",
    price: "$8",
    leads: "2,500 verified leads/mo",
    features: [
      "Everything in Starter",
      "High Priority Clients",
      "Advanced Metrics",
      "Website audit reports",
      "Saved lead lists",
      "Priority support",
    ],
    cta: "Go Pro",
    premium: true,
    popular: false,
  },
];

export default function Home() {
  const [search, setSearch] = useState({ query: '', location: '' });
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleDemoSearch = async (e) => {
    e.preventDefault();
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 mb-8">
              <Zap size={14} className="fill-emerald-500" /> Premium Lead Generation & Outreach
            </span>
            <h1 className="text-6xl md:text-7xl font-heading text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Find high‑intent clients <br />
              <span className="text-emerald-500 underline decoration-emerald-200 underline-offset-8">in 60 seconds.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Stop hunting for leads manually. LeadSnap finds businesses without websites, scores them with precision SEO analytics, and provides direct contact details instantly.
            </p>
            <div className="flex justify-center items-center gap-4 mb-12">
              <div className="flex -space-x-3">
                {['/avatar1.png', '/avatar2.png', '/avatar3.png', '/avatar4.png'].map((src, i) => (
                  <img key={i} src={src} alt={`User ${i + 1}`} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-bold">Trusted by 10,000+ freelancers worldwide</p>
            </div>
          </motion.div>

          {/* Interactive Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto bg-white p-4 rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100"
          >
            <form onSubmit={handleDemoSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Business type (e.g. Restaurant)"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  value={search.query}
                  onChange={e => setSearch({ ...search, query: e.target.value })}
                  suppressHydrationWarning
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Location (e.g. Austin, TX)"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  value={search.location}
                  onChange={e => setSearch({ ...search, location: e.target.value })}
                  suppressHydrationWarning
                />
              </div>
              <button type="submit" suppressHydrationWarning className="btn btn-primary px-8 whitespace-nowrap shadow-lg shadow-emerald-200">
                Find Leads
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-slate-900 mb-4">Everything you need to close more deals.</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">We&apos;ve built the ultimate toolkit for freelance client acquisition.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <TrendingUp className="text-emerald-500" />, title: "Precision Scoring", desc: "Our 0-100 scoring system analyzes website health, analytics presence, and SEO signals." },
              { icon: <Users className="text-emerald-500" />, title: "Real Data", desc: "Get real-time data from Google Maps API. No more outdated or stale lead lists." },
              { icon: <BarChart3 className="text-emerald-500" />, title: "Advanced Metrics", desc: "SEO scores, performance analysis, HTTPS checks, sitemap detection, and Google Analytics monitoring." },
              { icon: <Shield className="text-emerald-500" />, title: "High Priority Clients", desc: "Automatically identify high-value clients with scores ≥85. Available on Starter & Pro plans." },
            ].map((feature, i) => (
              <div key={i} className="premium-card p-8 bg-white">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-heading mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-slate-900 mb-4">Simple, transparent pricing.</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">One client pays for your subscription 10x over.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING.map((plan, i) => (
              <div key={i} className={`premium-card p-10 flex flex-col relative ${plan.premium ? 'border-emerald-200 ring-4 ring-emerald-50' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wider">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-heading text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 font-medium">/month</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2 font-medium">{plan.leads}</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="w-full">
                  <button className={`btn w-full ${plan.premium ? 'btn-primary' : 'btn-outline'}`}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-24 bg-emerald-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-slate-900 mb-4 leading-tight">Trusted by freelancers around the globe.</h2>
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="fill-emerald-500 text-emerald-500" size={20} />)}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <div className="text-3xl font-heading text-emerald-500 mb-2">5,000+</div>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">Leads Found</div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <div className="text-3xl font-heading text-emerald-500 mb-2">200+</div>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">Active Users</div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <div className="text-3xl font-heading text-emerald-500 mb-2">95%</div>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">Success Rate</div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <div className="text-3xl font-heading text-emerald-500 mb-2">24/7</div>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-slate-900 mb-4">Don't just take our word for it.</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">See how freelancers are using LeadSnap to grow their businesses.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Sarah Jenkins", role: "Web Designer", avatar: "/t_avatar1.png", text: "LeadSnap completely changed my business. I used to spend hours sending cold emails to random businesses. Now I only target high-priority leads with poor websites. I've closed $15k in new projects this month alone." },
              { name: "Michael Chen", role: "SEO Specialist", avatar: "/t_avatar2.png", text: "The advanced metrics are a game-changer. Being able to instantly see if a local business is missing schema markup or Google Analytics gives me the perfect pitch. My conversion rate went from 2% to 15%." },
              { name: "Elena Rodriguez", role: "Digital Marketer", avatar: "/t_avatar3.png", text: "I love the saved lists feature. I can prospect for an hour on Sunday, save all the high-scoring leads, and then systematically reach out to them during the week. It's incredibly efficient." },
              { name: "David Kim", role: "Freelance Developer", avatar: "/t_avatar4.png", text: "Finally, a tool that actually understands what freelancers need. The opportunity score is scary accurate. If it says 'High Priority', there's an 80% chance that business owner knows they need a better website." },
              { name: "Jessica Taylor", role: "Agency Owner", avatar: "/t_avatar5.png", text: "We upgraded to the Pro plan for our whole team. Being able to pull 100 leads at a time with full website audits attached has cut our prospecting time in half. Best ROI of any tool we use." }
            ].map((t, i) => (
              <div key={i} className="premium-card p-8 bg-slate-50 border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-100" />
                  <div>
                    <h4 className="font-bold text-slate-900">{t.name}</h4>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} className="fill-emerald-500 text-emerald-500" />)}
                </div>
                <p className="text-slate-600 font-medium italic leading-relaxed">&quot;{t.text}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-5xl font-heading text-slate-900 mb-6">Ready to find your next client?</h2>
        <p className="text-xl text-slate-500 mb-10 max-w-xl mx-auto">Join the hundreds of freelancers closing deals with LeadSnap.</p>
        <Link href="/signup">
          <button className="btn btn-primary px-12 py-4 text-lg shadow-2xl shadow-emerald-100">Get Started Now</button>
        </Link>
      </section>
    </div>
  );
}
