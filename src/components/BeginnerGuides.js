'use client';
import { useState } from 'react';
import { CheckCircle2, DollarSign, Target, ShieldCheck, BookOpen, Users, FileText, MessageSquare, Briefcase, TrendingUp, ChevronRight, ChevronLeft, Star, Lightbulb, AlertTriangle } from 'lucide-react';

const CHAPTERS = [
  {
    id: 1,
    title: "Getting Started with Freelancing",
    icon: <BookOpen className="text-emerald-500" />,
    sections: [
      {
        heading: "What is Freelance Web Services?",
        content: "Freelancing in web services means offering your skills — web design, development, SEO, or digital marketing — to businesses on a project-by-project basis. You work independently, set your own rates, and choose your own clients. LeadSnap helps you find those clients efficiently."
      },
      {
        heading: "Why Local Businesses?",
        content: "Millions of local businesses still don't have a website or have outdated ones. These businesses lose customers every day because people can't find them online. You're not just selling a website — you're solving a real business problem. A plumber without a website is losing $5,000-$20,000/month in leads to competitors who are online."
      },
      {
        heading: "The Opportunity in Numbers",
        content: "According to research, 27% of small businesses still don't have a website. Of those that do, over 50% have websites that aren't mobile-friendly or lack basic SEO. This means nearly 7 out of 10 local businesses need web services — and they're willing to pay for them."
      }
    ]
  },
  {
    id: 2,
    title: "Essential Skills You Need",
    icon: <Star className="text-emerald-500" />,
    sections: [
      {
        heading: "Technical Skills",
        content: "You don't need to be a coding expert. Start with: WordPress or website builders (Wix, Squarespace), basic HTML/CSS understanding, Google Analytics setup, basic SEO (title tags, meta descriptions, Google Business Profile), and responsive design principles. You can learn all of these in 2-4 weeks through free YouTube tutorials."
      },
      {
        heading: "Communication Skills",
        content: "This is arguably MORE important than technical skills. You need to: explain technical concepts in simple language, listen to the client's actual problems (not just what they say), respond to emails/calls within 24 hours, set clear expectations about timelines and deliverables, and handle feedback professionally without taking it personally."
      },
      {
        heading: "Sales & Persuasion",
        content: "Selling isn't about being pushy. It's about understanding the client's problem and presenting your service as the solution. Key skills: asking the right discovery questions, presenting ROI (not just features), handling objections confidently, creating urgency without being desperate, and following up consistently (80% of deals close after the 5th follow-up)."
      },
      {
        heading: "Business Management",
        content: "As a freelancer, you're running a business. Learn: basic invoicing and contracts, time management and project tracking, tax basics for self-employment, client onboarding processes, and how to manage multiple projects simultaneously."
      }
    ]
  },
  {
    id: 3,
    title: "Identifying High-Value Leads",
    icon: <Target className="text-emerald-500" />,
    sections: [
      {
        heading: "What Makes a High Priority Client?",
        content: "The best leads are businesses that: have good Google reviews (4.0+ stars) but NO website — they're established and profitable but missing online presence. They have money to spend because they already have customers. The high Opportunity Score in LeadSnap identifies these businesses automatically."
      },
      {
        heading: "Best Niches to Target",
        content: "Focus on high-ticket local businesses. Top niches by average project value: Dentists ($2,000-$5,000), Lawyers ($3,000-$8,000), Roofing companies ($1,500-$4,000), Plumbers ($1,000-$3,000), Restaurants ($1,500-$3,500), Real estate agents ($2,000-$5,000), Auto repair shops ($1,000-$2,500), and Landscaping companies ($1,000-$3,000). These businesses have high customer lifetime values, so spending $2,000-$5,000 on a website is a no-brainer for them."
      },
      {
        heading: "Reading the Opportunity Score",
        content: "LeadSnap's Opportunity Score (0-100) is calculated from real data, not random numbers. Score 85-100 (HIGH): Business has good reviews but no website — perfect target. Score 50-84 (MEDIUM): Has a website but it's missing analytics, HTTPS, sitemap, or has poor SEO. Score 0-49 (LOW): Already has a well-optimized website with analytics tracking. Focus your time on HIGH and MEDIUM scores."
      },
      {
        heading: "Using Advanced Metrics",
        content: "When you expand a lead in LeadSnap, you see real website analysis: SEO Score (based on title tags, meta descriptions, headings, schema markup), Performance Score (page size, optimization, lazy loading), Google Analytics (whether they track visitors), HTTPS (whether their site is secure), Contact Page (whether they capture leads), Sitemap (whether search engines can crawl them). Use these gaps as talking points in your pitch."
      }
    ]
  },
  {
    id: 4,
    title: "Setting Your Pricing Strategy",
    icon: <DollarSign className="text-emerald-500" />,
    sections: [
      {
        heading: "Pricing Models",
        content: "There are three main pricing models: Fixed Price (best for beginners — quote a flat rate for the project), Hourly Rate (good for ongoing work — charge $50-$150/hour depending on skill level), and Value-Based Pricing (advanced — charge based on the value you deliver, not time spent). Start with fixed pricing, then move to value-based as you gain confidence."
      },
      {
        heading: "Recommended Pricing Tiers",
        content: "For beginners: Basic Landing Page (1 page, contact form, mobile-friendly) — $500-$1,000. Standard Business Website (5-7 pages, SEO, contact forms) — $1,500-$3,000. Premium Package (custom design, SEO, analytics, content writing) — $3,000-$6,000. Monthly Maintenance (updates, backups, minor changes) — $100-$300/month. Monthly SEO Services — $500-$1,500/month."
      },
      {
        heading: "How to Quote Without Underselling",
        content: "Never quote immediately on a call. Say: 'Let me review everything and send you a detailed proposal within 24 hours.' This gives you time to research the client and craft a value-based quote. Always present 3 options (Basic, Standard, Premium) — most clients pick the middle option. Include a monthly maintenance upsell on every quote — it creates recurring revenue."
      },
      {
        heading: "When to Raise Your Prices",
        content: "Raise your prices when: you're closing more than 50% of your proposals (you're too cheap), you have more than 2 weeks of backlogged work, you've completed 10+ projects successfully, or clients never push back on your pricing. A good rule: raise prices 15-20% every 6 months."
      }
    ]
  },
  {
    id: 5,
    title: "Reaching Out to Clients",
    icon: <MessageSquare className="text-emerald-500" />,
    sections: [
      {
        heading: "Cold Email Template",
        content: "Subject: Quick question about [Business Name]'s online presence\n\nHi [Name],\n\nI noticed [Business Name] has excellent reviews on Google ([X] stars, [Y] reviews) but doesn't seem to have a website yet.\n\nI help local businesses like yours get found online and attract more customers. A simple, professional website could help you:\n- Show up when people search '[business type] near me'\n- Display your services and pricing\n- Let customers book appointments or request quotes online\n\nWould you be open to a quick 10-minute call this week to see if this could work for your business?\n\nBest,\n[Your Name]"
      },
      {
        heading: "Cold Call Script",
        content: "Opening: 'Hi, is this [Owner Name]? My name is [Your Name]. I'm a local web designer and I came across [Business Name] while researching businesses in [City]. I noticed you have amazing reviews — [X] stars! — but I couldn't find a website for your business. Is that something you've been thinking about?'\n\nIf yes: 'Great! I specialize in helping local businesses like yours get online. Would you have 10 minutes this week for a quick call to discuss how a website could bring you more customers?'\n\nIf no/not interested: 'No problem at all. If you ever change your mind, feel free to reach out. Have a great day!'"
      },
      {
        heading: "Follow-Up Strategy",
        content: "Most freelancers give up after one message. Here's a proven follow-up sequence: Day 1 — Initial outreach (email or call). Day 3 — Follow-up email ('Just wanted to make sure my email didn't get lost...'). Day 7 — Provide value (send a free mini website audit). Day 14 — Social proof ('I just helped a [similar business] increase their leads by 40%...'). Day 30 — Final attempt ('I'll assume the timing isn't right. Feel free to reach out anytime.'). This sequence alone will triple your response rate."
      },
      {
        heading: "Where to Find Contact Info",
        content: "LeadSnap provides phone numbers and emails when available. Additionally: check the business's Google Business Profile, look for social media pages (Facebook often has contact info), use the phone number from Google Maps to call directly, visit the business in person for local leads (highest conversion rate), and check industry directories specific to their niche."
      }
    ]
  },
  {
    id: 6,
    title: "Closing the Deal",
    icon: <Briefcase className="text-emerald-500" />,
    sections: [
      {
        heading: "The Discovery Call",
        content: "Your first call isn't about selling — it's about understanding. Ask these questions: 'What's your biggest challenge in getting new customers?', 'How do most of your current customers find you?', 'Have you tried having a website before? What happened?', 'What would an extra 10-20 customers per month mean for your business?', 'What's your budget range for getting this set up?'. Listen more than you talk. Take notes. The answers become your proposal."
      },
      {
        heading: "Creating a Winning Proposal",
        content: "Your proposal should include: Executive summary (2-3 sentences about their problem and your solution), scope of work (exactly what you'll deliver, page by page), timeline (realistic dates for each milestone), investment (your 3-tier pricing options), testimonials or portfolio links, next steps (how to get started). Keep it to 2-3 pages maximum. Send as a PDF, never a Google Doc."
      },
      {
        heading: "Handling Common Objections",
        content: "'It's too expensive' — 'I understand. Let me ask: how much is one new customer worth to your business? If this website brings you just 5 new customers per month at $[their average ticket], that's $[amount] in new revenue. The website pays for itself in the first month.'\n\n'I need to think about it' — 'Of course! What specific concerns do you want to think over? Maybe I can address them now.'\n\n'My nephew can do it' — 'That's great if they have the time! Just keep in mind that a professional website needs SEO, mobile optimization, security, and ongoing maintenance. Happy to chat if you want a second opinion later.'\n\n'I don't need a website' — 'I totally get that. Out of curiosity, when someone searches for [their business type] in [their city], do you know who shows up? [Pause] That's who your potential customers are calling instead.'"
      },
      {
        heading: "Getting the Deposit",
        content: "Never start work without a deposit. Standard structure: 50% upfront before work begins, 25% at the design approval stage, 25% on launch/completion. For projects under $1,000: 50% upfront, 50% on completion. Always use a written contract. Send the invoice immediately after verbal agreement — don't wait."
      }
    ]
  },
  {
    id: 7,
    title: "Managing Client Relationships",
    icon: <Users className="text-emerald-500" />,
    sections: [
      {
        heading: "Onboarding New Clients",
        content: "After they sign, send a welcome email within 1 hour that includes: a thank you message, a clear timeline with milestones, a list of what you need from them (logo, photos, content, access credentials), your preferred communication method, and next steps. First impressions set the tone for the entire project."
      },
      {
        heading: "Communication Best Practices",
        content: "Set boundaries early: define working hours and response times. Send weekly progress updates even if the client doesn't ask. Use a project management tool (Trello, Notion, or even a shared Google Doc). Never surprise a client — if there's a delay, communicate immediately. Confirm all decisions in writing (email) even if discussed on a call."
      },
      {
        heading: "Dealing with Difficult Clients",
        content: "Scope creep (they keep asking for more): 'I'd love to add that feature! It's outside our original scope, so I'll send you a quick quote for the addition.' Unresponsive clients: Set deadlines — 'I need your feedback by Friday to stay on schedule. After 2 weeks of no response, the project will be paused.' Negative feedback: Don't get defensive. Ask specific questions: 'What specifically would you like changed? I want to make sure this is exactly what you envisioned.'"
      },
      {
        heading: "Turning Clients into Referrals",
        content: "After delivering a great project: ask for a Google review (most will say yes), ask 'Do you know any other business owners who might need a website?', offer a referral bonus ($100-$200 off their next invoice for each referral), stay in touch with a monthly check-in email. One happy client can bring you 3-5 new clients through word of mouth."
      }
    ]
  },
  {
    id: 8,
    title: "Essential Documents & Templates",
    icon: <FileText className="text-emerald-500" />,
    sections: [
      {
        heading: "Freelance Contract Essentials",
        content: "Every project needs a contract. Include these clauses: project scope (detailed description of deliverables), payment terms (amounts, due dates, late fees), timeline (start date, milestones, completion date), revision policy (e.g., '2 rounds of revisions included'), intellectual property (who owns the final work — usually the client after full payment), termination clause (what happens if either party cancels), liability limitation (protect yourself from unlimited claims)."
      },
      {
        heading: "Invoice Template Structure",
        content: "Professional invoices should include: your business name and contact info, client's business name and contact info, unique invoice number (INV-001, INV-002), date issued and payment due date, itemized list of services with prices, payment methods accepted (bank transfer, PayPal, Stripe), late payment terms (e.g., '1.5% monthly interest after 30 days'), total amount due with any taxes. Use tools like Wave, FreshBooks, or even a clean Google Sheets template."
      },
      {
        heading: "Project Brief Template",
        content: "Before starting any project, fill out a project brief: business name and industry, project goals (what does the client want to achieve?), target audience (who are their customers?), competitor websites (2-3 examples they like), brand assets (logo, colors, fonts), required pages and features, content (who's writing it — you or the client?), technical requirements (hosting, domain, integrations), deadline and milestones."
      },
      {
        heading: "Website Audit Report Template",
        content: "Use this for pitching clients with existing websites: Overall Score (using LeadSnap's metrics), SEO Analysis (title tags, meta descriptions, heading structure, schema markup), Performance (page load speed, mobile responsiveness, image optimization), Security (HTTPS, security headers), Analytics (tracking setup, conversion tracking), Recommendations (prioritized list of improvements with estimated impact). This report builds massive trust and positions you as an expert."
      }
    ]
  },
  {
    id: 9,
    title: "Scaling Your Business",
    icon: <TrendingUp className="text-emerald-500" />,
    sections: [
      {
        heading: "From One-Off Projects to Recurring Revenue",
        content: "The real money in freelancing is recurring revenue. Offer: monthly website maintenance ($100-$300/month), monthly SEO services ($500-$1,500/month), social media management ($300-$800/month), Google Ads management ($300-$500/month + ad spend). Goal: build to $3,000-$5,000 in monthly recurring revenue. That's only 15-25 maintenance clients."
      },
      {
        heading: "Building a Portfolio",
        content: "Your portfolio is your best sales tool. Start with: 2-3 free or discounted projects for friends/family, screenshot before/after results, collect testimonials from every client, create case studies showing measurable results ('Increased leads by 40% in 3 months'). Host your portfolio on a professional website. Update it after every project."
      },
      {
        heading: "When to Hire Help",
        content: "Consider hiring when: you're turning away clients due to capacity, you're spending time on tasks below your hourly rate, specific tasks could be done better by a specialist. Start by outsourcing: content writing, basic WordPress setup, social media posting, bookkeeping. Use platforms like Upwork or Fiverr to find affordable help."
      },
      {
        heading: "Setting Income Goals",
        content: "Month 1-3: Focus on landing your first 3-5 clients. Target: $2,000-$5,000. Month 4-6: Build referral pipeline and start monthly services. Target: $5,000-$8,000/month. Month 7-12: Systemize your process and scale. Target: $8,000-$15,000/month. Year 2: Consider specializing in a niche and raising prices. Target: $15,000-$25,000/month. These are realistic goals for someone putting in 30-40 hours/week."
      }
    ]
  },
  {
    id: 10,
    title: "Common Mistakes to Avoid",
    icon: <AlertTriangle className="text-emerald-500" />,
    sections: [
      {
        heading: "Pricing Too Low",
        content: "The #1 mistake new freelancers make. Charging $200 for a website attracts bad clients and devalues your work. Even as a complete beginner, charge at least $500 for a basic site. Remember: clients who pay more are actually easier to work with — they value your time and expertise."
      },
      {
        heading: "Not Using Contracts",
        content: "Working without a contract is asking for trouble. Even for a $500 project, always have a written agreement. It protects both you and the client. A simple 1-2 page contract is better than nothing."
      },
      {
        heading: "Trying to Learn Everything",
        content: "You don't need to know React, Node.js, Python, and AWS to build websites for local businesses. Master ONE approach (e.g., WordPress + Elementor) and deliver great results with it. Clients don't care what technology you use — they care about results."
      },
      {
        heading: "Giving Up Too Early",
        content: "Most freelancers quit in the first 3 months. The reality: month 1 is about learning and making mistakes, month 2 is about refining your process, month 3 is when you start seeing traction. If you can push through the first 90 days, you'll be ahead of 90% of people who tried."
      }
    ]
  }
];

export default function BeginnerGuides() {
  const [activeChapter, setActiveChapter] = useState(0);

  const chapter = CHAPTERS[activeChapter];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-heading text-slate-900 mb-2">The Complete Freelancer&apos;s Guide</h2>
        <p className="text-slate-500 font-medium">10 chapters • Everything you need to start closing clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chapter Navigation */}
        <div className="lg:col-span-1">
          <div className="premium-card bg-white border-slate-200 p-4 sticky top-24">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Chapters</h3>
            <div className="space-y-1">
              {CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeChapter === idx
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    activeChapter === idx ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {ch.id}
                  </span>
                  <span className="truncate">{ch.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="lg:col-span-3">
          <div className="premium-card bg-white border-slate-200 p-8">
            {/* Chapter Title */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                {chapter.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Chapter {chapter.id} of {CHAPTERS.length}</p>
                <h2 className="text-2xl font-heading text-slate-900">{chapter.title}</h2>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {chapter.sections.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-lg font-heading text-slate-800 mb-3 flex items-center gap-2">
                    <Lightbulb size={18} className="text-emerald-500 shrink-0" />
                    {section.heading}
                  </h3>
                  <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-line pl-7">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
              <button
                onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
                disabled={activeChapter === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  activeChapter === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft size={16} /> Previous Chapter
              </button>
              <span className="text-xs text-slate-400 font-bold">{activeChapter + 1} / {CHAPTERS.length}</span>
              <button
                onClick={() => setActiveChapter(Math.min(CHAPTERS.length - 1, activeChapter + 1))}
                disabled={activeChapter === CHAPTERS.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  activeChapter === CHAPTERS.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                Next Chapter <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
