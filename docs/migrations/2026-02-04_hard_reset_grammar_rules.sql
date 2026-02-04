-- HARD RESET: public.grammar_rules (PostgREST exposure recovery)
-- Run EXACTLY as provided in Supabase SQL Editor

drop table if exists public.grammar_rules cascade;

create table public.grammar_rules (
  id uuid primary key default gen_random_uuid(),
  language_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  rule_type text not null,
  pattern text not null,
  examples jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.grammar_rules enable row level security;

create policy "grammar_rules_select"
on public.grammar_rules
for select
to authenticated
using (true);

create policy "grammar_rules_insert"
on public.grammar_rules
for insert
to authenticated
with check (owner_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert on public.grammar_rules to authenticated;

alter publication supabase_realtime drop table if exists public.grammar_rules;
alter publication supabase_realtime add table public.grammar_rules;

notify pgrst, 'reload schema';
