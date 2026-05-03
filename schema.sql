-- LeadSnap Database Schema

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro')),
    credits_remaining INTEGER DEFAULT 80,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Leads Table
CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    business_name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    website TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    opportunity_level TEXT CHECK (opportunity_level IN ('HIGH', 'MEDIUM', 'LOW')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Searches Table
CREATE TABLE searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    query TEXT NOT NULL,
    location TEXT NOT NULL,
    leads_found INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Saved Leads Table (NEW)
CREATE TABLE saved_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    place_id TEXT NOT NULL,
    business_name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    rating NUMERIC,
    reviews INTEGER,
    opportunity_score INTEGER CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
    priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    seo_score INTEGER DEFAULT 0,
    performance_score INTEGER DEFAULT 0,
    has_google_analytics BOOLEAN DEFAULT false,
    has_https BOOLEAN DEFAULT false,
    has_contact_page BOOLEAN DEFAULT false,
    has_sitemap BOOLEAN DEFAULT false,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, place_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Leads
CREATE POLICY "Users can view their own leads" ON leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Searches
CREATE POLICY "Users can view their own searches" ON searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches" ON searches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Saved Leads
CREATE POLICY "Users can view their own saved leads" ON saved_leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved leads" ON saved_leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved leads" ON saved_leads
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subscription_tier, credits_remaining)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'free', 80);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to deduct credits safely
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET credits_remaining = credits_remaining - amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
