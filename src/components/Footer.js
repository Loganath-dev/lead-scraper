import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <div className="font-heading text-xl text-slate-900 mb-2">LeadSnap</div>
          <p className="text-slate-500 text-sm max-w-xs">
            The premium lead generation engine for modern freelancers and agencies.
          </p>
        </div>
        <div className="flex gap-8 text-sm font-medium text-slate-600">
          <Link href="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-emerald-600 transition-colors">Terms & Conditions</Link>
          <a href="mailto:leadscraper07@gmail.com" className="hover:text-emerald-600 transition-colors">Contact</a>
        </div>
        <div className="text-slate-400 text-sm">
          © {new Date().getFullYear()} LeadSnap. Built for the world.
        </div>
      </div>
    </footer>
  );
}
