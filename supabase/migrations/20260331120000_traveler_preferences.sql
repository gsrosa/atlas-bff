-- Traveler behavioral profile (JSON). Merged into AI prompts on trip generation.
alter table public.profiles
  add column if not exists traveler_preferences jsonb not null default '{}'::jsonb;

comment on column public.profiles.traveler_preferences is
  'Partial or full UserProfile JSON; patched via tRPC travelerProfile.patch';
