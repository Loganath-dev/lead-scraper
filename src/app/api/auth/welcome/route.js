import { createServerClient } from '@/lib/supabase-server';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiting (Note: This is reset on every serverless execution, 
// but provides a basic layer of protection in a single execution context)
const rateLimit = new Map();

export async function POST(req) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Please log in.' }), { status: 401 });
    }

    const { email } = await req.json();

    if (!email || email !== user.email) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400 });
    }

    // Basic rate limit check
    const now = Date.now();
    const lastRequest = rateLimit.get(user.id) || 0;
    if (now - lastRequest < 60000) { // 1 minute cooldown per user
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), { status: 429 });
    }
    rateLimit.set(user.id, now);

    const { data, error } = await resend.emails.send({
      from: 'LeadSnap <onboarding@resend.dev>', // Use resend's testing domain by default until custom domain is verified
      to: email,
      subject: 'Welcome to LeadSnap! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
          <h1 style="color: #10b981;">Welcome to LeadSnap!</h1>
          <p>Hi there,</p>
          <p>Thanks for joining LeadSnap! We're excited to help you find high-opportunity leads and grow your freelance business.</p>
          <p>You now have access to:</p>
          <ul>
            <li><strong>Premium Lead Search:</strong> Find local businesses without websites.</li>
            <li><strong>Intelligent Scoring:</strong> Know which clients are most likely to pay.</li>
            <li><strong>Beginner Guides:</strong> Learn the secrets to closing clients.</li>
          </ul>
          <p>Log in to your dashboard to get started:</p>
          <a href="https://leadsnap.app/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Go to Dashboard</a>
          <p>If you have any questions, just reply to this email.</p>
          <p>Happy hunting!<br>The LeadSnap Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email via Resend' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Welcome email sent successfully' }), { status: 200 });
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
