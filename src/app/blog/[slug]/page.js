import Navbar from '@/components/Navbar';
import { BLOG_POSTS } from '@/data/blogs';
import { notFound } from 'next/navigation';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return { title: 'Not Found' };
  
  return {
    title: `${post.title} | LeadSnap Blog`,
    description: post.excerpt,
  };
}

export default function BlogPost({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/blog" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors mb-8">
          <ArrowLeft size={16} className="mr-2" /> Back to all articles
        </Link>
        
        <article className="premium-card bg-white border-slate-200 overflow-hidden">
          <div className="w-full h-64 md:h-96 bg-slate-100 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
              <span className="flex items-center gap-2"><Calendar size={16} /> {post.date}</span>
              <span className="flex items-center gap-2"><Clock size={16} /> {post.readTime}</span>
              <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-600">{post.author}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-heading text-slate-900 mb-8 leading-tight tracking-tight">
              {post.title}
            </h1>
            
            {/* Blog Content */}
            <div 
              className="prose prose-slate prose-lg max-w-none prose-headings:font-heading prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-li:text-slate-600"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* CTA */}
            <div className="mt-16 p-8 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <h3 className="text-2xl font-heading text-slate-900 mb-4">Ready to start finding high-paying clients?</h3>
              <p className="text-slate-600 mb-6">Join thousands of freelancers using LeadSnap to instantly find local businesses that need your services.</p>
              <Link href="/signup" className="btn btn-primary px-8 py-4 shadow-xl shadow-emerald-100 inline-block">
                Start for Free Today
              </Link>
            </div>
          </div>
        </article>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-12">
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
