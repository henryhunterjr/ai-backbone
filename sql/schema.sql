-- AI Backbone — Database Schema
-- Run this in the Supabase SQL Editor (paste the whole thing, click Run)
-- Safe to run multiple times (all statements use IF NOT EXISTS)

-- Step 1: Enable pgvector for semantic search
create extension if not exists vector;

-- Step 2: memories — the core knowledge store
create table if not exists memories (
  id               uuid default gen_random_uuid() primary key,
  content          text not null,
  embedding        vector(1536),
  category         text,
  source           text,
  importance       int default 3 check (importance between 1 and 5),
  tags             text[],
  related_ids      uuid[],
  created_at       timestamptz default now(),
  last_accessed_at timestamptz,
  access_count     int default 0
);

-- Step 3: projects — track active initiatives
create table if not exists projects (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  description text,
  embedding   vector(1536),
  status      text default 'active',
  url         text,
  updated_at  timestamptz default now()
);

-- Step 4: insights — high-signal extracted knowledge
create table if not exists insights (
  id             uuid default gen_random_uuid() primary key,
  insight        text not null,
  embedding      vector(1536),
  source_session text,
  tags           text[],
  created_at     timestamptz default now()
);

-- Step 5: daily_briefs — archived daily summaries
create table if not exists daily_briefs (
  id               uuid default gen_random_uuid() primary key,
  brief_date       date not null unique,
  run_id           text,
  summary          text,
  embedding        vector(1536),
  action_items     jsonb,
  draft_replies    jsonb,
  community_pulse  jsonb,
  content_ideas    jsonb,
  morning_post     jsonb,
  created_at       timestamptz default now()
);

-- Step 6: member_profiles — knowledge about people
create table if not exists member_profiles (
  id              uuid default gen_random_uuid() primary key,
  skool_name      text not null,
  embedding       vector(1536),
  notes           text,
  tags            text[],
  first_seen_at   timestamptz default now(),
  last_active_at  timestamptz,
  updated_at      timestamptz default now()
);

-- Step 7: Semantic search function
create or replace function search_memories(
  query_embedding vector(1536),
  match_count     int default 5,
  filter_category text default null
)
returns table (id uuid, content text, category text, source text, similarity float)
language sql
as $$
  select
    id,
    content,
    category,
    source,
    1 - (embedding <=> query_embedding) as similarity
  from memories
  where
    (filter_category is null or category = filter_category)
    and embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Step 8: Vector indexes for fast search
create index if not exists memories_embedding_idx
  on memories using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists insights_embedding_idx
  on insights using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists daily_briefs_embedding_idx
  on daily_briefs using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists member_profiles_embedding_idx
  on member_profiles using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Step 9: Row-level security
alter table memories enable row level security;
alter table projects enable row level security;
alter table insights enable row level security;
alter table daily_briefs enable row level security;
alter table member_profiles enable row level security;

-- Allow read access for the anon role (the service role bypasses RLS automatically)
create policy if not exists "anon_read_memories"
  on memories for select to anon using (true);

create policy if not exists "anon_read_projects"
  on projects for select to anon using (true);

create policy if not exists "anon_read_daily_briefs"
  on daily_briefs for select to anon using (true);
