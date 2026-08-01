CREATE TABLE audit_leads (
  audit_slug TEXT PRIMARY KEY
    CHECK (audit_slug ~ '^[a-z0-9-]+$'),

  email TEXT NOT NULL
    CHECK (char_length(email) BETWEEN 3 AND 254),
  domain TEXT NOT NULL
    CHECK (char_length(domain) BETWEEN 1 AND 253),
  company_name TEXT NOT NULL
    CHECK (char_length(company_name) BETWEEN 1 AND 200),
  niche TEXT NOT NULL DEFAULT ''
    CHECK (char_length(niche) <= 120),
  city TEXT NOT NULL DEFAULT ''
    CHECK (char_length(city) <= 120),
  state TEXT NOT NULL DEFAULT ''
    CHECK (char_length(state) <= 40),

  overall_score SMALLINT NOT NULL
    CHECK (overall_score BETWEEN 0 AND 100),
  grade TEXT NOT NULL
    CHECK (grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D')),
  score_band TEXT NOT NULL
    CHECK (score_band IN ('hot', 'warm', 'cold')),

  report_url TEXT NOT NULL
    CHECK (char_length(report_url) BETWEEN 1 AND 2048),
  report_expires_at TIMESTAMPTZ NOT NULL,
  analysis_source TEXT NOT NULL
    CHECK (analysis_source IN ('netlify_ai_gateway', 'fallback')),
  pagespeed_source TEXT NOT NULL
    CHECK (pagespeed_source IN ('google_pagespeed', 'fallback')),

  email_delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      email_delivery_status IN ('pending', 'sent', 'not_configured', 'failed')
    ),
  email_sent_at TIMESTAMPTZ,

  lead_source TEXT NOT NULL DEFAULT 'self_service_audit'
    CHECK (lead_source = 'self_service_audit'),
  pipeline_stage TEXT NOT NULL DEFAULT 'ready'
    CHECK (
      pipeline_stage IN (
        'ready',
        'contacted',
        'qualified',
        'proposal',
        'won',
        'lost',
        'archived'
      )
    ),
  privacy_notice_version TEXT NOT NULL
    CHECK (char_length(privacy_notice_version) BETWEEN 1 AND 32),
  notes TEXT,

  retention_until TIMESTAMPTZ NOT NULL
    DEFAULT (NOW() + INTERVAL '12 months'),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (report_expires_at > submitted_at),
  CONSTRAINT audit_leads_retention_window_check CHECK (
    retention_until > submitted_at
    AND retention_until <= submitted_at + INTERVAL '12 months'
  ),
  CHECK (
    email_delivery_status <> 'sent'
    OR email_sent_at IS NOT NULL
  )
);

CREATE INDEX audit_leads_pipeline_submitted_idx
  ON audit_leads (pipeline_stage, submitted_at DESC);

CREATE INDEX audit_leads_email_idx
  ON audit_leads (LOWER(email));

CREATE INDEX audit_leads_domain_idx
  ON audit_leads (domain);

CREATE INDEX audit_leads_retention_idx
  ON audit_leads (retention_until);

CREATE FUNCTION audit_leads_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_leads_touch_updated_at
BEFORE UPDATE ON audit_leads
FOR EACH ROW
EXECUTE FUNCTION audit_leads_touch_updated_at();
