import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, getAuthenticatedUser } from '@/lib/supabase-server';

const supabaseAdmin = createAdminClient();

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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const body = await req.json();
    const parseResult = z.object({ lead: LeadSchema }).safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid lead format' }, { status: 400 });
    }

    const { lead } = parseResult.data;
    const { data, error } = await supabaseAdmin
      .from('saved_leads')
      .upsert({
        user_id: userId,
        place_id: lead.placeId,
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

    if (error) throw error;
    return NextResponse.json({ saved: true, data });
  } catch (error) {
    console.error('Save API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE — Unsave a lead
export async function DELETE(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = user.id;

    const { placeId } = await req.json();
    if (!placeId) return NextResponse.json({ error: 'Invalid placeId' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('saved_leads')
      .delete()
      .eq('user_id', userId)
      .eq('place_id', placeId);

    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET — Get all saved leads
export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = user.id;

    const { data, error } = await supabaseAdmin
      .from('saved_leads')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) throw error;

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
    console.error('GET API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
