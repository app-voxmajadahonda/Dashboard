alter table municipal_indicators
  add column if not exists source_key text,
  add column if not exists expires_at timestamptz;

create index if not exists municipal_indicators_expires_at_idx
  on municipal_indicators (organization_id, expires_at);

create index if not exists municipal_indicators_source_key_idx
  on municipal_indicators (organization_id, source_key);

update municipal_indicators indicator
set
  source_key = coalesce(indicator.source_key, source.source_key),
  expires_at = coalesce(indicator.expires_at, indicator.updated_at + (source.refresh_interval_days || ' days')::interval)
from data_sources source
where
  indicator.organization_id = source.organization_id
  and indicator.source_name is not null
  and lower(indicator.source_name) = lower(source.provider)
  and indicator.expires_at is null;
