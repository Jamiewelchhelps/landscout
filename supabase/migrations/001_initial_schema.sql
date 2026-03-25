-- ============================================================
-- LandScout Initial Schema
-- ============================================================

-- Enable PostGIS for spatial queries
create extension if not exists postgis;

-- Enable uuid generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. parcels — stores land listings
-- ============================================================
create table parcels (
  id                uuid primary key default uuid_generate_v4(),
  state_fips        text not null,
  county_fips       text not null,
  apn               text not null,
  full_address      text,
  county            text,
  state             text,
  latitude          double precision not null,
  longitude         double precision not null,
  acreage           double precision,
  price             integer, -- stored in cents
  price_per_acre    integer, -- stored in cents
  zoning_code       text,
  zoning_description text,
  road_access       boolean,
  water_access      boolean,
  utilities_available boolean,
  listing_source    text,
  listing_url       text,
  owner_name        text,
  description       text,
  photos            jsonb default '[]'::jsonb,
  status            text not null default 'active'
                    check (status in ('active', 'sold', 'pending')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Unique constraint matching parcel ID format: {state_fips}{county_fips}_{apn}
create unique index parcels_fips_apn_idx on parcels (state_fips, county_fips, apn);

-- Spatial index for map bounding-box queries
create index parcels_location_idx on parcels using gist (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Index for filtering by status
create index parcels_status_idx on parcels (status);

-- Index for price range searches
create index parcels_price_idx on parcels (price);

-- Index for acreage range searches
create index parcels_acreage_idx on parcels (acreage);

-- ============================================================
-- 2. profiles — stores user info
-- ============================================================
create table profiles (
  id                uuid primary key references auth.users on delete cascade,
  display_name      text,
  email             text,
  subscription_tier text not null default 'free',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- 3. saved_parcels — when a user saves a parcel
-- ============================================================
create table saved_parcels (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles (id) on delete cascade,
  parcel_id         uuid not null references parcels (id) on delete cascade,
  notes             text,
  created_at        timestamptz not null default now()
);

-- Prevent duplicate saves
create unique index saved_parcels_user_parcel_idx on saved_parcels (user_id, parcel_id);

-- ============================================================
-- 4. intelligence_reports — cached AI reports
-- ============================================================
create table intelligence_reports (
  id                uuid primary key default uuid_generate_v4(),
  parcel_id         uuid not null references parcels (id) on delete cascade,
  section_type      text not null,
  content           jsonb not null default '{}'::jsonb,
  generated_at      timestamptz not null default now(),
  expires_at        timestamptz
);

-- One report per parcel per section type
create unique index intelligence_reports_parcel_section_idx
  on intelligence_reports (parcel_id, section_type);

-- ============================================================
-- 5. search_alerts — saved searches
-- ============================================================
create table search_alerts (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles (id) on delete cascade,
  name              text not null,
  filters           jsonb not null default '{}'::jsonb,
  frequency         text not null,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- updated_at trigger function
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger parcels_updated_at
  before update on parcels
  for each row execute function set_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- parcels: anyone can read, only service role can write
alter table parcels enable row level security;

create policy "Parcels are publicly readable"
  on parcels for select
  using (true);

-- profiles: users can read and update only their own row
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- saved_parcels: users can only access their own saves
alter table saved_parcels enable row level security;

create policy "Users can view their own saved parcels"
  on saved_parcels for select
  using (auth.uid() = user_id);

create policy "Users can save parcels"
  on saved_parcels for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved parcels"
  on saved_parcels for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved parcels"
  on saved_parcels for delete
  using (auth.uid() = user_id);

-- intelligence_reports: publicly readable (cached data)
alter table intelligence_reports enable row level security;

create policy "Intelligence reports are publicly readable"
  on intelligence_reports for select
  using (true);

-- search_alerts: users can only access their own alerts
alter table search_alerts enable row level security;

create policy "Users can view their own search alerts"
  on search_alerts for select
  using (auth.uid() = user_id);

create policy "Users can create search alerts"
  on search_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own search alerts"
  on search_alerts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own search alerts"
  on search_alerts for delete
  using (auth.uid() = user_id);
