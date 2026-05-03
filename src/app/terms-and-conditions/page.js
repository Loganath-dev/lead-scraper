'use client';
import { motion } from 'framer-motion';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-heading text-slate-900 mb-8">Terms and Conditions</h1>
          <p className="text-slate-500 mb-6">Last Updated: May 2026</p>

          <section className="space-y-6 text-slate-600 leading-relaxed">
            <h2 className="text-2xl font-heading text-slate-800 mt-8">1. Acceptance of Terms</h2>
            <p>
              By accessing and using LeadSnap, you agree to be bound by these Terms and Conditions and all applicable laws and regulations in India.
            </p>

            <h2 className="text-2xl font-heading text-slate-800 mt-8">2. Use License</h2>
            <p>
              Permission is granted to use LeadSnap for personal or business lead generation purposes. This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="text-2xl font-heading text-slate-800 mt-8">3. Subscription and Payments</h2>
            <p>
              LeadSnap offers various subscription tiers. Payments are processed securely. Subscriptions can be cancelled at any time, but refunds are subject to our refund policy.
            </p>

            <h2 className="text-2xl font-heading text-slate-800 mt-8">4. Limitations</h2>
            <p>
              In no event shall LeadSnap or its suppliers be liable for any damages arising out of the use or inability to use the materials on LeadSnap.
            </p>

            <h2 className="text-2xl font-heading text-slate-800 mt-8">5. Governing Law</h2>
            <p>
              Any claim relating to LeadSnap shall be governed by the laws of India, specifically the Information Technology Act, 2000, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-heading text-slate-800 mt-8">6. Contact Information</h2>
            <p>
              For any legal inquiries, please contact: <br />
              <strong>Email: leadscraper07@gmail.com</strong>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
