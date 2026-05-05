-- Little Fight Fit Check POC schema.
-- Run in Supabase SQL editor before enabling SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
-- Keep service-role keys in Netlify environment variables only.

create extension if not exists pgcrypto;

create table if not exists public.fit_check_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new' check (
    status in (
      'new',
      'new_urgent',
      'partial',
      'reviewed',
      'contacted',
      'scheduled',
      'active',
      'not_fit',
      'archived',
      'spam',
      'needs_human_review',
      'partial_call'
    )
  ),
  source text,
  intake_mode text not null default 'website',
  lead_name text,
  business_name text,
  email text,
  phone text,
  website_url text,
  industry text,
  location text,
  team_size text,
  initial_problem text,
  urgency_level text,
  primary_category text,
  secondary_categories jsonb not null default '[]'::jsonb,
  tools_mentioned jsonb not null default '[]'::jsonb,
  raw_answers jsonb not null default '{}'::jsonb,
  ai_client_summary text,
  ai_internal_brief text,
  ai_followup_email text,
  keep_notes text,
  connect_notes text,
  replace_notes text,
  build_notes text,
  obstacles jsonb not null default '[]'::jsonb,
  lead_score jsonb not null default '{}'::jsonb,
  recommended_next_step text,
  consent_ai_summary boolean not null default false,
  consent_recording boolean not null default false,
  transcript_text text,
  call_recording_url text,
  error_log jsonb not null default '{}'::jsonb
);

create table if not exists public.fit_check_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.fit_check_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb
);

create index if not exists fit_check_leads_created_at_idx
  on public.fit_check_leads (created_at desc);

create index if not exists fit_check_leads_status_idx
  on public.fit_check_leads (status);

create index if not exists fit_check_leads_category_idx
  on public.fit_check_leads (primary_category);

create index if not exists fit_check_events_lead_idx
  on public.fit_check_events (lead_id, created_at desc);
