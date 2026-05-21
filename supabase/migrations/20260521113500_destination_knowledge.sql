create extension if not exists vector with schema extensions;

create table if not exists public.destination_knowledge (
  id uuid primary key default gen_random_uuid(),
  destination text not null,
  country text,
  title text not null,
  content text not null,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists destination_knowledge_destination_idx
  on public.destination_knowledge (lower(destination));

create index if not exists destination_knowledge_country_idx
  on public.destination_knowledge (lower(country))
  where country is not null;

create index if not exists destination_knowledge_embedding_idx
  on public.destination_knowledge
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.destination_knowledge enable row level security;

drop trigger if exists destination_knowledge_set_updated_at
  on public.destination_knowledge;

create trigger destination_knowledge_set_updated_at
  before update on public.destination_knowledge
  for each row execute function public.set_plans_updated_at();
