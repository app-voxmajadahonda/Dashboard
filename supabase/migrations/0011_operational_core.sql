do $$
begin
  if not exists (select 1 from pg_type where typname = 'operational_priority') then
    create type operational_priority as enum ('low', 'medium', 'high', 'critical');
  end if;

  if not exists (select 1 from pg_type where typname = 'alert_status') then
    create type alert_status as enum ('open', 'in_review', 'resolved', 'dismissed');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('pending', 'in_progress', 'blocked', 'completed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'calendar_event_type') then
    create type calendar_event_type as enum (
      'pleno',
      'comision',
      'junta_portavoces',
      'consejo',
      'reunion',
      'acto',
      'plazo',
      'otro'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'calendar_event_status') then
    create type calendar_event_status as enum ('scheduled', 'held', 'cancelled', 'pending_minutes', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'plenary_session_type') then
    create type plenary_session_type as enum ('ordinary', 'extraordinary', 'urgent');
  end if;

  if not exists (select 1 from pg_type where typname = 'plenary_session_status') then
    create type plenary_session_status as enum (
      'scheduled',
      'held',
      'pending_minutes',
      'minutes_approved',
      'closed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'committee_session_status') then
    create type committee_session_status as enum ('scheduled', 'held', 'pending_report', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'motion_status') then
    create type motion_status as enum (
      'draft',
      'registered',
      'debated',
      'approved',
      'rejected',
      'withdrawn',
      'follow_up'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'institutional_request_type') then
    create type institutional_request_type as enum (
      'question',
      'oral_question',
      'written_question',
      'request',
      'information_request',
      'file_request',
      'appearance_request',
      'spokesperson_board_request',
      'appeal'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'institutional_request_status') then
    create type institutional_request_status as enum (
      'draft',
      'registered',
      'pending_response',
      'answered',
      'overdue',
      'reiterated',
      'closed',
      'appealed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'vote_item_type') then
    create type vote_item_type as enum ('motion', 'amendment', 'agreement', 'ordinance', 'budget', 'other');
  end if;
end
$$;

create or replace function is_org_manager(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from memberships
    where memberships.organization_id = org_id
      and memberships.user_id = auth.uid()
      and memberships.role in ('admin', 'spokesperson')
      and memberships.active = true
  );
$$;

create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'general',
  priority operational_priority not null default 'medium',
  status alert_status not null default 'open',
  due_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null,
  related_entity_type text,
  related_entity_id uuid,
  recommended_action text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, category, related_entity_type, related_entity_id)
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'pending',
  priority operational_priority not null default 'medium',
  assigned_to uuid references profiles(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  due_at timestamptz,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  event_type calendar_event_type not null default 'otro',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  status calendar_event_status not null default 'scheduled',
  related_entity_type text,
  related_entity_id uuid,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists plenary_sessions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  session_type plenary_session_type not null default 'ordinary',
  session_date timestamptz not null,
  status plenary_session_status not null default 'scheduled',
  agenda_document_id uuid references documents(id) on delete set null,
  minutes_document_id uuid references documents(id) on delete set null,
  video_url text,
  internal_report text,
  political_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists committees (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  responsible_councillor_id uuid references profiles(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists committee_sessions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  committee_id uuid references committees(id) on delete set null,
  title text not null,
  session_date timestamptz not null,
  status committee_session_status not null default 'scheduled',
  agenda_document_id uuid references documents(id) on delete set null,
  internal_report text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists motions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  strategic_axis text,
  responsible_councillor_id uuid references profiles(id) on delete set null,
  plenary_session_id uuid references plenary_sessions(id) on delete set null,
  status motion_status not null default 'draft',
  registered_at timestamptz,
  result text,
  vote_summary jsonb not null default '{}'::jsonb,
  document_id uuid references documents(id) on delete set null,
  speech_notes text,
  press_notes text,
  follow_up_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists institutional_requests (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  request_type institutional_request_type not null default 'question',
  title text not null,
  description text,
  area text,
  responsible_councillor_id uuid references profiles(id) on delete set null,
  target_body text,
  registered_at timestamptz,
  due_at timestamptz,
  answered_at timestamptz,
  status institutional_request_status not null default 'draft',
  response_summary text,
  document_id uuid references documents(id) on delete set null,
  response_document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists votes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plenary_session_id uuid references plenary_sessions(id) on delete set null,
  item_title text not null,
  item_type vote_item_type not null default 'other',
  vox_vote text,
  pp_vote text,
  psoe_vote text,
  vecinos_vote text,
  mas_madrid_vote text,
  result text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alerts_org_status_priority_due_idx
  on alerts (organization_id, status, priority, due_at);
create index if not exists alerts_related_idx
  on alerts (organization_id, related_entity_type, related_entity_id);
create index if not exists tasks_org_assigned_status_due_idx
  on tasks (organization_id, assigned_to, status, due_at);
create index if not exists calendar_events_org_starts_idx
  on calendar_events (organization_id, starts_at);
create index if not exists plenary_sessions_org_date_idx
  on plenary_sessions (organization_id, session_date);
create index if not exists committees_org_active_idx
  on committees (organization_id, active);
create index if not exists committee_sessions_org_date_idx
  on committee_sessions (organization_id, session_date);
create index if not exists motions_org_status_idx
  on motions (organization_id, status, created_at desc);
create index if not exists institutional_requests_org_status_due_idx
  on institutional_requests (organization_id, status, due_at);
create index if not exists votes_org_plenary_idx
  on votes (organization_id, plenary_session_id);

alter table alerts enable row level security;
alter table tasks enable row level security;
alter table calendar_events enable row level security;
alter table plenary_sessions enable row level security;
alter table committees enable row level security;
alter table committee_sessions enable row level security;
alter table motions enable row level security;
alter table institutional_requests enable row level security;
alter table votes enable row level security;

drop policy if exists "Members can read alerts" on alerts;
drop policy if exists "Managers can manage alerts" on alerts;
drop policy if exists "Members can read tasks" on tasks;
drop policy if exists "Members can create own tasks" on tasks;
drop policy if exists "Members can update own tasks" on tasks;
drop policy if exists "Managers can manage tasks" on tasks;
drop policy if exists "Members can read calendar events" on calendar_events;
drop policy if exists "Managers can manage calendar events" on calendar_events;
drop policy if exists "Members can read plenary sessions" on plenary_sessions;
drop policy if exists "Managers can manage plenary sessions" on plenary_sessions;
drop policy if exists "Members can read committees" on committees;
drop policy if exists "Managers can manage committees" on committees;
drop policy if exists "Members can read committee sessions" on committee_sessions;
drop policy if exists "Managers can manage committee sessions" on committee_sessions;
drop policy if exists "Members can read motions" on motions;
drop policy if exists "Managers can manage motions" on motions;
drop policy if exists "Members can read institutional requests" on institutional_requests;
drop policy if exists "Managers can manage institutional requests" on institutional_requests;
drop policy if exists "Members can read votes" on votes;
drop policy if exists "Managers can manage votes" on votes;

create policy "Members can read alerts"
  on alerts for select
  using (is_org_member(organization_id));

create policy "Managers can manage alerts"
  on alerts for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));

create policy "Members can read tasks"
  on tasks for select
  using (is_org_member(organization_id));

create policy "Members can create own tasks"
  on tasks for insert
  with check (
    is_org_member(organization_id)
    and created_by = auth.uid()
    and (assigned_to is null or assigned_to = auth.uid())
  );

create policy "Members can update own tasks"
  on tasks for update
  using (is_org_member(organization_id) and (created_by = auth.uid() or assigned_to = auth.uid()))
  with check (is_org_member(organization_id) and (created_by = auth.uid() or assigned_to = auth.uid()));

create policy "Managers can manage tasks"
  on tasks for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));

create policy "Members can read calendar events"
  on calendar_events for select
  using (is_org_member(organization_id));

create policy "Managers can manage calendar events"
  on calendar_events for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));

create policy "Members can read plenary sessions"
  on plenary_sessions for select
  using (is_org_member(organization_id));

create policy "Managers can manage plenary sessions"
  on plenary_sessions for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));

create policy "Members can read committees"
  on committees for select
  using (is_org_member(organization_id));

create policy "Managers can manage committees"
  on committees for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));

create policy "Members can read committee sessions"
  on committee_sessions for select
  using (is_org_member(organization_id));

create policy "Managers can manage committee sessions"
  on committee_sessions for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));

create policy "Members can read motions"
  on motions for select
  using (is_org_member(organization_id));

create policy "Managers can manage motions"
  on motions for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));

create policy "Members can read institutional requests"
  on institutional_requests for select
  using (is_org_member(organization_id));

create policy "Managers can manage institutional requests"
  on institutional_requests for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));

create policy "Members can read votes"
  on votes for select
  using (is_org_member(organization_id));

create policy "Managers can manage votes"
  on votes for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));
