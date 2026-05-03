import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAuthUserId(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

const LeadSchema = z.object({
  placeId: z.string().min(1).max(255),
  name: z.string().max(500).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(100).optional().nullable(),
  email: z.string().max(255).optional().nullable(),
  website: z.string().max(500).optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviews: z.number().min(0).optional().nullable(),
  opportunityScore: z.number().min(0).max(100).optional().nullable(),
  priority: z.string().max(20).optional().nullable(),
  metrics: z.object({
    seoScore: z.number().min(0).max(100).optional().nullable(),
    performanceScore: z.number().min(0).max(100).optional().nullable(),
    hasGoogleAnalytics: z.boolean().optional().nullable(),
    hasHttps: z.boolean().optional().nullable(),
    hasContactPage: z.boolean().optional().nullable(),
    hasSitemap: z.boolean().optional().nullable(),
  }).optional().nullable()
});

// POST — Save a lead
export async function POST(req) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      console.warn(`[SECURITY] Unauthorized save attempt from IP: ${req.headers.get('x-forwarded-for') || 'unknown'}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Strict Zod Validation
    const parseResult = z.object({ lead: LeadSchema }).safeParse(body);
    
    if (!parseResult.success) {
      console.warn(`[SECURITY] Invalid payload structure from User: ${userId}`, parseResult.error.format());
      return NextResponse.json({ error: 'Invalid lead object format' }, { status: 400 });
    }

    const { lead } = parseResult.data;
    const placeId = lead.placeId;

    const { data, error } = await supabaseAdmin
      .from('saved_leads')
      .upsert({
        user_id: userId,
        place_id: placeId,
        business_name: lead.name || 'Unknown',
        address: lead.address || 'Unknown',
        phone: lead.phone,
        email: lead.email,
        website: lead.website,
        rating: lead.rating || 0,
        reviews: lead.reviews || 0,
        opportunity_score: lead.opportunityScore || 0,
        priority: lead.priority || 'LOW',
        seo_score: lead.metrics?.seoScore || 0,
        performance_score: lead.metrics?.performanceScore || 0,
        has_google_analytics: Boolean(lead.metrics?.hasGoogleAnalytics),
        has_https: Boolean(lead.metrics?.hasHttps),
        has_contact_page: Boolean(lead.metrics?.hasContactPage),
        has_sitemap: Boolean(lead.metrics?.hasSitemap),
      }, {
        onConflict: 'user_id,place_id',
      })
      .select();

    if (error) {
      console.error(`[CRITICAL ERROR] DB Save Failure for User ${userId}:`, error);
      return NextResponse.json({ error: 'Failed to save lead to database' }, { status: 500 });
    }

    console.log(`[AUDIT] User ${userId} successfully saved lead: ${placeId}`);
    return NextResponse.json({ saved: true, data });
  } catch (error) {
    console.error(`[CRITICAL ERROR] Save API Exception for User ${req.headers.get('Authorization') ? 'Authenticated' : 'Unknown'}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE — Unsave a lead
export async function DELETE(req) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      console.warn(`[SECURITY] Unauthorized delete attempt from IP: ${req.headers.get('x-forwarded-for') || 'unknown'}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { placeId } = await req.json();

    if (!placeId || typeof placeId !== 'string') {
      return NextResponse.json({ error: 'Invalid placeId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('saved_leads')
      .delete()
      .eq('user_id', userId)
      .eq('place_id', placeId);

    if (error) {
      console.error(`[CRITICAL ERROR] Delete lead error for User ${userId}:`, error);
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }

    console.log(`[AUDIT] User ${userId} successfully deleted lead: ${placeId}`);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(`[CRITICAL ERROR] Delete API Exception for User ${req.headers.get('Authorization') ? 'Authenticated' : 'Unknown'}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// GET — Get all saved leads for a user
export async function GET(req) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('saved_leads')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Get saved leads error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to match the lead format used in frontend
    const leads = (data || []).map(item => ({
      name: item.business_name,
      address: item.address,
      phone: item.phone,
      email: item.email,
      website: item.website,
      rating: item.rating,
      reviews: item.reviews,
      opportunityScore: item.opportunity_score,
      priority: item.priority,
      placeId: item.place_id,
      savedAt: item.saved_at,
      metrics: {
        seoScore: item.seo_score,
        performanceScore: item.performance_score,
        hasGoogleAnalytics: item.has_google_analytics,
        hasHttps: item.has_https,
        hasContactPage: item.has_contact_page,
        hasSitemap: item.has_sitemap,
      }
    }));

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Saved leads API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
