import { NextResponse } from 'next/server';
import { createAdminClient, getAuthenticatedUser } from '@/lib/supabase-server';
import axios from 'axios';
import { z } from 'zod';

const supabase = createAdminClient();

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Rate limit map: userId -> [timestamps]
const searchRateLimit = new Map();
const MAX_SEARCHES_PER_MINUTE = 5;

async function checkRateLimit(userId) {
  const now = Date.now();
  const timestamps = searchRateLimit.get(userId) || [];
  const recent = timestamps.filter(t => now - t < 60000);
  
  if (recent.length >= MAX_SEARCHES_PER_MINUTE) return false;
  
  recent.push(now);
  searchRateLimit.set(userId, recent);
  return true;
}

const SearchSchema = z.object({
  query: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  count: z.union([z.number(), z.string()]).optional().transform(val => {
    const num = Number(val);
    if (isNaN(num) || num < 1 || num > 80) return 50;
    return num;
  })
});

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      console.warn(`[SECURITY] Unauthorized search attempt`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    if (!(await checkRateLimit(userId))) {
      return NextResponse.json({ error: 'Too many searches. Please wait a minute.' }, { status: 429 });
    }

    const body = await req.json();
    
    // Strict Zod Validation
    const parseResult = SearchSchema.safeParse(body);
    if (!parseResult.success) {
      console.warn(`[SECURITY] Invalid payload from User: ${userId}`, parseResult.error.format());
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
    }
    
    const { query, location, count: requestedCount } = parseResult.data;

    console.log(`[AUDIT] User ${userId} searching for "${query}" in "${location}" (Count: ${requestedCount})`);

    // 1. Get user profile and check limits
    let finalCount = 40; // Free plan default: always 40
    let userTier = 'free';

    if (userId) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        userTier = profile.subscription_tier;
        if (userTier === 'free') {
          // Free plan: fixed 40 leads per search
          finalCount = 40;
        } else {
          // Paid plans: allow 20, 40, or 80 leads per search
          const allowed = [20, 40, 80];
          finalCount = allowed.includes(requestedCount) ? requestedCount : 40;
        }
        if (profile.credits_remaining < finalCount) {
          console.warn(`[AUDIT] User ${userId} hit credit limit`);
          return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 });
        }
      }
    }

    // 2. Search Google Maps Places (Text Search)
    const searchQuery = `${query} in ${location}`;
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}`;

    let allPlaces = [];
    let nextPageToken = null;

    // Fetch first page
    const firstRes = await axios.get(textSearchUrl);
    allPlaces = [...firstRes.data.results];
    nextPageToken = firstRes.data.next_page_token;

    // Fetch additional pages if needed (Google returns ~20 per page)
    while (nextPageToken && allPlaces.length < finalCount) {
      // Google requires a short delay before using next_page_token
      await new Promise(r => setTimeout(r, 2000));
      const nextUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${GOOGLE_API_KEY}`;
      const nextRes = await axios.get(nextUrl);
      allPlaces = [...allPlaces, ...nextRes.data.results];
      nextPageToken = nextRes.data.next_page_token;
    }

    const places = allPlaces.slice(0, finalCount);

    // 3. Fetch Place Details for each place (for phone, website, etc.)
    const leads = await Promise.all(places.map(async (place) => {
      let details = {};
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,url,business_status&key=${GOOGLE_API_KEY}`;
        const detailsRes = await axios.get(detailsUrl);
        details = detailsRes.data.result || {};
      } catch (e) {
        // Fall back to text search data
        details = {};
      }

      const website = details.website || null;
      const phone = details.formatted_phone_number || 'N/A';
      const rating = details.rating || place.rating || 0;
      const reviews = details.user_ratings_total || 0;
      const name = details.name || place.name;
      const address = details.formatted_address || place.formatted_address;

      // 4. Analyze website for advanced metrics
      let metrics = {
        seoScore: 0,
        performanceScore: 0,
        hasGoogleAnalytics: false,
        hasHttps: false,
        hasContactPage: false,
        hasSitemap: false,
        email: null,
      };

      if (website) {
        metrics = await analyzeWebsite(website);
      }

      // 5. Compute Opportunity Score
      let opportunityScore = computeOpportunityScore(website, metrics, rating, reviews);

      // 6. Determine priority level
      let priority = 'LOW';
      if (opportunityScore >= 85) priority = 'HIGH';
      else if (opportunityScore >= 50) priority = 'MEDIUM';

      return {
        name,
        address,
        phone,
        email: metrics.email || null,
        website,
        rating: Math.round(rating * 10) / 10,
        reviews,
        opportunityScore,
        priority,
        placeId: place.place_id,
        metrics: {
          seoScore: metrics.seoScore,
          performanceScore: metrics.performanceScore,
          hasGoogleAnalytics: metrics.hasGoogleAnalytics,
          hasHttps: metrics.hasHttps,
          hasContactPage: metrics.hasContactPage,
          hasSitemap: metrics.hasSitemap,
        }
      };
    }));

    // 7. Deduct credits
    if (userId) {
      await supabase.rpc('deduct_credits', { user_id: userId, amount: leads.length });
    }

    // 8. Log the search
    if (userId) {
      await supabase.from('searches').insert({
        user_id: userId,
        query: query,
        location: location,
        leads_found: leads.length,
      });
      console.log(`[AUDIT] Search complete. Deducted ${leads.length} credits from User ${userId}`);
    }

    return NextResponse.json({ leads });
  } catch (error) {
    console.error(`[CRITICAL ERROR] Search API Exception for User ${userId || 'unknown'}:`, error?.response?.data || error.message || error);
    return NextResponse.json({ error: 'An unexpected error occurred while processing your request.' }, { status: 500 });
  }
}

/**
 * Analyze a website for SEO, performance, analytics, HTTPS, contact page, sitemap
 */
async function analyzeWebsite(url) {
  const result = {
    seoScore: 0,
    performanceScore: 0,
    hasGoogleAnalytics: false,
    hasHttps: false,
    hasContactPage: false,
    hasSitemap: false,
    email: null,
  };

  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    result.hasHttps = targetUrl.startsWith('https://');

    // Fetch the main page
    const res = await axios.get(targetUrl, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeadSnap/1.0)' },
      maxRedirects: 3,
    });
    const html = typeof res.data === 'string' ? res.data : '';

    // Check Google Analytics / Tag Manager / Facebook Pixel
    result.hasGoogleAnalytics = /google-analytics\.com|googletagmanager\.com|gtag|ga\.js|analytics\.js|fbevents\.js|facebook-pixel/i.test(html);

    // Extract email addresses from the page
    const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches && emailMatches.length > 0) {
      // Filter out common non-business emails
      const filtered = emailMatches.filter(e => !/example\.com|test\.com|domain\.com|email\.com|sentry|wixpress|wordpress/i.test(e));
      result.email = filtered[0] || null;
    }

    // Check for contact page link
    result.hasContactPage = /href=["'][^"']*contact[^"']*["']/i.test(html);

    // SEO scoring
    let seoPoints = 0;
    if (/<title[^>]*>.+<\/title>/i.test(html)) seoPoints += 20;
    if (/meta\s+name=["']description["']/i.test(html)) seoPoints += 20;
    if (/<h1[^>]*>/i.test(html)) seoPoints += 15;
    if (/alt=["'][^"']+["']/i.test(html)) seoPoints += 10;
    if (/canonical/i.test(html)) seoPoints += 10;
    if (/og:title|og:description/i.test(html)) seoPoints += 10;
    if (/schema\.org|application\/ld\+json/i.test(html)) seoPoints += 15;
    result.seoScore = Math.min(seoPoints, 100);

    // Performance scoring (heuristic based on page content)
    let perfPoints = 60; // Base
    const htmlSize = html.length;
    if (htmlSize < 50000) perfPoints += 15;
    else if (htmlSize < 100000) perfPoints += 10;
    else if (htmlSize > 200000) perfPoints -= 10;

    // Check for minified CSS/JS (indicates optimization)
    if (/\.min\.css|\.min\.js/i.test(html)) perfPoints += 10;
    // Check for lazy loading
    if (/loading=["']lazy["']/i.test(html)) perfPoints += 10;
    // Check for image optimization hints
    if (/srcset/i.test(html)) perfPoints += 5;
    result.performanceScore = Math.max(0, Math.min(perfPoints, 100));

    // Check for sitemap
    try {
      const sitemapUrl = new URL('/sitemap.xml', targetUrl).href;
      const sitemapRes = await axios.get(sitemapUrl, { timeout: 3000 });
      result.hasSitemap = sitemapRes.status === 200 && /urlset|sitemapindex/i.test(sitemapRes.data);
    } catch {
      result.hasSitemap = false;
    }

  } catch (e) {
    // Website is unreachable — treat as high opportunity
    result.seoScore = 0;
    result.performanceScore = 0;
  }

  return result;
}

/**
 * Compute opportunity score (0-100) — FULLY DETERMINISTIC, NO RANDOM VALUES
 * 
 * High Priority = Good reviews + No website (established business needing online presence)
 * The score measures how much a freelancer can help this business.
 */
function computeOpportunityScore(website, metrics, rating, reviews) {
  let score = 0;

  // ═══ NO WEBSITE — Huge opportunity ═══
  if (!website) {
    // Base: 70 points for having no website at all
    score = 70;

    // Bonus for being an established business (good reviews = they have customers but no online presence)
    if (rating >= 4.5) score += 12;
    else if (rating >= 4.0) score += 8;
    else if (rating >= 3.5) score += 5;

    // Bonus for review volume (more reviews = more established = better client)
    if (reviews >= 200) score += 13;
    else if (reviews >= 100) score += 10;
    else if (reviews >= 50) score += 7;
    else if (reviews >= 20) score += 4;
    else if (reviews >= 5) score += 2;

    return Math.min(score, 100);
  }

  // ═══ HAS WEBSITE — Score based on website quality gaps ═══
  // Inverse: worse website = higher opportunity for freelancer

  // SEO gap (0-20 points)
  const seoGap = 100 - metrics.seoScore;
  score += Math.round(seoGap * 0.20);

  // Performance gap (0-15 points)
  const perfGap = 100 - metrics.performanceScore;
  score += Math.round(perfGap * 0.15);

  // Missing analytics = opportunity to set up tracking (15 points)
  if (!metrics.hasGoogleAnalytics) score += 15;

  // No HTTPS = security issue, easy sell (10 points)
  if (!metrics.hasHttps) score += 10;

  // No contact page = missing lead capture (8 points)
  if (!metrics.hasContactPage) score += 8;

  // No sitemap = SEO gap (7 points)
  if (!metrics.hasSitemap) score += 7;

  // Bonus for established businesses with poor websites (they can afford services)
  if (rating >= 4.0 && reviews >= 50) score += 5;
  if (reviews >= 100) score += 3;

  return Math.min(score, 100);
}
