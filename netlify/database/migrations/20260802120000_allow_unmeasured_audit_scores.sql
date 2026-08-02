-- A provider outage is an availability state, not a zero score. Keep the lead
-- and report useful without fabricating Lighthouse measurements.
ALTER TABLE audit_leads
  ALTER COLUMN overall_score DROP NOT NULL,
  ALTER COLUMN grade DROP NOT NULL,
  ALTER COLUMN score_band DROP NOT NULL;

ALTER TABLE audit_leads
  DROP CONSTRAINT IF EXISTS audit_leads_pagespeed_source_check;

ALTER TABLE audit_leads
  ADD CONSTRAINT audit_leads_pagespeed_source_check CHECK (
    pagespeed_source IN ('google_pagespeed', 'unavailable', 'fallback')
  );
