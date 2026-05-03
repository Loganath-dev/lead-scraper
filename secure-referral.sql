-- Create a secure RPC function to handle referrals
-- SECURITY DEFINER allows the function to bypass RLS and act with database owner privileges
CREATE OR REPLACE FUNCTION process_referral(referrer_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Ensure the referrer exists before adding credits
  IF EXISTS (SELECT 1 FROM profiles WHERE id = referrer_id) THEN
    UPDATE profiles
    SET credits_remaining = credits_remaining + 500
    WHERE id = referrer_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
