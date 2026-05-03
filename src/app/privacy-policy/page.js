'use client';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-heading text-slate-900 mb-8">Privacy Policy</h1>
          <p className="text-slate-500 mb-6">Last Updated: May 2026</p>

          <section className="space-y-6 text-slate-600 leading-relaxed">
            <h2 className="text-2xl font-heading text-slate-800 mt-8">1. Information We Collect</h2>
            <p>
              LeadSnap collects basic information to provide lead generation services. This includes your email, name, and any data provided during registration. We also collect usage data to improve our services.
            </p>

            <h2 className="text-2xl font-heading text-slate-800 mt-8">2. Use of Data</h2>
            <p>
              Your data is used to manage your account, process payments, and provide the lead generation features of the platform. We do not sell your personal information to third parties.
            </p>

            <h2 className="text-2xl font-heading text-slate-800 mt-8">3. Compliance with Indian Law</h2>
            <p>
              This Privacy Policy is governed by and construed in accordance with the Information Technology Act, 2000 and the rules made thereunder (including the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011).
            </p>

            <h2 className="text-2xl font-heading text-slate-800 mt-8">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data from unauthorized access, alteration, or destruction.
            </p>

            <h2 className="text-2xl font-heading text-slate-800 mt-8">5. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please contact us at: <br />
              <strong>Email: leadscraper07@gmail.com</strong>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
