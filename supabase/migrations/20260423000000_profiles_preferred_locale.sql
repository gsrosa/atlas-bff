-- Add preferred UI locale to user profiles.
alter table public.profiles
  add column if not exists preferred_locale text;

comment on column public.profiles.preferred_locale is 'User-preferred UI locale (e.g. en-US, pt-BR, es-ES). NULL means fallback to browser default.';
