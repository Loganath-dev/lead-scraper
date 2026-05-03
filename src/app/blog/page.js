import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { BLOG_POSTS } from '@/data/blogs';
import { ChevronRight, Clock, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Blog | LeadSnap - Tips for Freelancers',
  description: 'Learn how to find, close, and manage local business clients with our expert guides and strategies.',
};

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-heading text-slate-900 mb-6 tracking-tight">Expert Strategies for Freelancers</h1>
          <p className="text-lg text-slate-600">Grow your web design business, land high-paying local clients, and scale your recurring revenue with our proven guides.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col premium-card bg-white border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-slate-100 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
                </div>
                <h2 className="text-xl font-heading text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors leading-snug">{post.title}</h2>
                <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center text-sm font-bold text-emerald-600 group-hover:gap-2 transition-all">
                  Read Article <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">L</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">LeadSnap</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} LeadSnap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
