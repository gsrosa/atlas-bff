create or replace function public.match_destination_knowledge(
  query_embedding vector(768),
  match_count integer default 5,
  match_threshold double precision default 0.75,
  destination_filter text default null,
  country_filter text default null
)
returns table (
  id uuid,
  destination text,
  country text,
  title text,
  content text,
  source_url text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    dk.id,
    dk.destination,
    dk.country,
    dk.title,
    dk.content,
    dk.source_url,
    dk.metadata,
    1 - (dk.embedding <=> query_embedding) as similarity
  from public.destination_knowledge dk
  where
    (destination_filter is null or dk.destination ilike '%' || destination_filter || '%')
    and (country_filter is null or dk.country ilike '%' || country_filter || '%')
    and 1 - (dk.embedding <=> query_embedding) >= match_threshold
  order by dk.embedding <=> query_embedding
  limit match_count;
$$;

revoke all on function public.match_destination_knowledge(
  vector(768),
  integer,
  double precision,
  text,
  text
) from public;

grant execute on function public.match_destination_knowledge(
  vector(768),
  integer,
  double precision,
  text,
  text
) to service_role;
