import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  metadataBase: new URL('https://leadsnap.app'),
  title: "LeadSnap | High‑Quality Lead Generation for Freelancers",
  description: "Find local businesses without websites, score them, and close clients with one‑click proposals. Earn credits by referring friends.",
  keywords: ["lead generation", "freelance leads", "referral program", "SEO", "AEO"],
  icons: {
    icon: "/leadsnap_icon.svg",
    shortcut: "/leadsnap_icon.svg",
    apple: "/leadsnap_icon.svg",
  },
  openGraph: {
    title: "LeadSnap – Premium Lead Generation for Freelancers",
    description: "Discover high‑opportunity local businesses instantly and boost your freelance income.",
    url: "https://leadsnap.app",
    siteName: "LeadSnap",
    images: [{ url: "/og-image.png" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadSnap – Premium Lead Generation",
    description: "Find leads, score them, and pitch with one click. Earn 500 credits for each referral!",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* JSON‑LD for SEO & AEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "LeadSnap",
              "url": "https://leadsnap.app",
              "description": "Premium lead generation platform for freelancers. Find local businesses, score them, and pitch instantly.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "url": "https://leadsnap.app" },
              "author": { "@type": "Organization", "name": "LeadSnap Team" }
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
