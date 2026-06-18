create extension if not exists "uuid-ossp";
create extension if not exists vector;

create type app_role as enum ('admin', 'councillor', 'api_integration');
create type document_kind as enum (
  'decree',
  'plenary_agreement',
  'government_board_agreement',
  'agenda',
  'minutes',
  'motion',
  'amendment',
  'committee',
  'contract',
  'report',
  'budget',
  'agreement',
  'grant',
  'other'
);
create type processing_status as enum (
  'uploaded',
  'text_extracted',
  'ai_extracted',
  'needs_review',
  'validated',
  'failed'
);

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  party text not null,
  municipality text not null,
  province text,
  region text,
  municipal_website text,
  transparency_portal text,
  electronic_office text,
  contracting_authorities jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create table memberships (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role app_role not null,
  invited_email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  constraint membership_user_or_invite check (user_id is not null or invited_email is not null)
);

create table documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  kind document_kind not null default 'other',
  title text not null,
  source_name text,
  source_url text,
  official_date date,
  governing_body text,
  processing_status processing_status not null default 'uploaded',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table document_files (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  original_filename text,
  created_at timestamptz not null default now()
);

create table document_extractions (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  raw_text text,
  summary text,
  structured_data jsonb not null default '{}'::jsonb,
  model text,
  confidence numeric(5, 4),
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create table government_actions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,
  title text not null,
  action_type text,
  area text,
  governing_body text,
  official_date date,
  amount numeric(14, 2),
  third_party text,
  risk_level text not null default 'normal',
  follow_up_status text not null default 'pending',
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  actor_user_id uuid references profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table memberships enable row level security;
alter table documents enable row level security;
alter table document_files enable row level security;
alter table document_extractions enable row level security;
alter table government_actions enable row level security;
alter table audit_log enable row level security;

create or replace function is_org_member(org_id uuid)
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
      and memberships.active = true
  );
$$;

create or replace function is_org_admin(org_id uuid)
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
      and memberships.role = 'admin'
      and memberships.active = true
  );
$$;

create policy "Members can read organizations"
  on organizations for select
  using (is_org_member(id));

create policy "Admins can update organizations"
  on organizations for update
  using (is_org_admin(id))
  with check (is_org_admin(id));

create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Users can insert own profile"
  on profiles for insert
  with check (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Members can read memberships in their orgs"
  on memberships for select
  using (is_org_member(organization_id));

create policy "Admins can manage memberships"
  on memberships for all
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));

create policy "Members can read documents"
  on documents for select
  using (is_org_member(organization_id));

create policy "Members can create documents"
  on documents for insert
  with check (is_org_member(organization_id));

create policy "Members can update documents"
  on documents for update
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

create policy "Members can read document files"
  on document_files for select
  using (
    exists (
      select 1
      from documents
      where documents.id = document_files.document_id
        and is_org_member(documents.organization_id)
    )
  );

create policy "Members can manage document files"
  on document_files for all
  using (
    exists (
      select 1
      from documents
      where documents.id = document_files.document_id
        and is_org_member(documents.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from documents
      where documents.id = document_files.document_id
        and is_org_member(documents.organization_id)
    )
  );

create policy "Members can read document extractions"
  on document_extractions for select
  using (
    exists (
      select 1
      from documents
      where documents.id = document_extractions.document_id
        and is_org_member(documents.organization_id)
    )
  );

create policy "Members can manage document extractions"
  on document_extractions for all
  using (
    exists (
      select 1
      from documents
      where documents.id = document_extractions.document_id
        and is_org_member(documents.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from documents
      where documents.id = document_extractions.document_id
        and is_org_member(documents.organization_id)
    )
  );

create policy "Members can read government actions"
  on government_actions for select
  using (is_org_member(organization_id));

create policy "Members can manage government actions"
  on government_actions for all
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

create policy "Members can read audit log"
  on audit_log for select
  using (is_org_member(organization_id));

insert into organizations (
  slug,
  name,
  party,
  municipality,
  province,
  region,
  municipal_website,
  transparency_portal,
  electronic_office,
  contracting_authorities
) values (
  'vox-majadahonda',
  'Grupo Municipal Vox Majadahonda',
  'Vox',
  'Majadahonda',
  'Madrid',
  'Comunidad de Madrid',
  'https://www.majadahonda.org',
  'https://www.majadahonda.org/transparencia',
  'https://sede.majadahonda.org',
  '["Ayuntamiento de Majadahonda", "Alcaldia", "Junta de Gobierno Local"]'::jsonb
);
