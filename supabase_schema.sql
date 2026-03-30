-- SunnyGuard AI Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  credits BIGINT DEFAULT 1000000, -- Default 100万 pts for new users
  tier TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Chat Logs Table (Audit & History)
CREATE TABLE IF NOT EXISTS public.chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'L1', 'L2', 'L3'
  pts_consumed INTEGER NOT NULL,
  savings_percent INTEGER DEFAULT 0,
  latency_ms INTEGER,
  audit_passed BOOLEAN DEFAULT TRUE,
  audit_report JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Topup Transactions
CREATE TABLE IF NOT EXISTS public.topup_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  amount_usd DECIMAL(10, 2) NOT NULL,
  pts_added BIGINT NOT NULL,
  method TEXT NOT NULL, -- 'wechat', 'alipay', 'paypal', 'usdt'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  reference_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topup_transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Simplified for prototype, should be hardened with Clerk JWT)
-- Note: In a production app, you'd use the Clerk-Supabase integration to verify JWTs.
-- For now, we assume the server-side Supabase client (service_role) handles most logic.

CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (true); -- Server handles filtering by clerk_id

CREATE POLICY "Users can view their own chat logs" ON public.chat_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own transactions" ON public.topup_transactions
  FOR SELECT USING (true);

-- 6. Functions & Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
