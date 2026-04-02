-- AI Backbone — Content Queue for The Bread Authority
-- Run this in the Supabase SQL Editor
-- Safe to run multiple times (all statements use IF NOT EXISTS)

-- Content queue table for pending/approved/rejected content
create table if not exists content_queue (
  id               uuid default gen_random_uuid() primary key,
  title            text not null,
  url              text not null,
  content_type     text not null check (content_type in ('video', 'recipe', 'blog', 'lesson', 'glossary', 'pinterest')),
  source_platform  text,
  topic_slugs      text[] default '{}',
  date_published   text,
  performance_tier text default 'new' check (performance_tier in ('top', 'strong', 'growing', 'new')),
  status           text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_by     text,
  reviewed_by      text,
  reviewed_at      timestamptz,
  metadata         jsonb default '{}',
  created_at       timestamptz default now()
);

-- Index for queue queries
create index if not exists content_queue_status_idx on content_queue (status, created_at desc);
create index if not exists content_queue_topic_idx on content_queue using gin (topic_slugs);

-- RLS
alter table content_queue enable row level security;

create policy if not exists "anon_read_content_queue"
  on content_queue for select to anon using (true);
